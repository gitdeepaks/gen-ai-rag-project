import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads")
    const filePath = join(uploadDir, file.name)

    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      // If directory doesn't exist, create it and try again
      const { mkdir } = await import("fs/promises")
      await mkdir(uploadDir, { recursive: true })
      await writeFile(filePath, buffer)
    }

    // Extract text content based on file type
    let content = ""
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      content = buffer.toString("utf-8")
    } else if (file.name.endsWith(".csv")) {
      content = buffer.toString("utf-8")
    } else {
      // For other file types, return the raw content
      content = buffer.toString("utf-8")
    }

    return NextResponse.json({
      filename: file.name,
      size: file.size,
      type: file.type,
      content: content,
      path: filePath,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
