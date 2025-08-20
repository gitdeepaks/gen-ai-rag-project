import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RAG-Bot/1.0)",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${response.status}` }, { status: response.status })
    }

    const html = await response.text()

    // Simple HTML text extraction (in production, use a proper HTML parser)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    return NextResponse.json({
      url,
      content: textContent,
      title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || url,
      length: textContent.length,
    })
  } catch (error) {
    console.error("Scraping error:", error)
    return NextResponse.json({ error: "Failed to scrape website" }, { status: 500 })
  }
}
