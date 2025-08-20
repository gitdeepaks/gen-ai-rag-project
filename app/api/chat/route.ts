import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { query, context } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided context. 
Use the context to provide accurate and relevant answers. If the context doesn't contain enough information 
to answer the question, say so clearly.

Context:
${context || "No context provided."}

Please provide a comprehensive answer based on the context above.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return NextResponse.json({
      answer: response.choices[0].message.content,
      usage: response.usage,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
