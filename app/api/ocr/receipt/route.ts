import { type NextRequest, NextResponse } from "next/server"
import { parseReceiptText } from "@/lib/integrations/ocr"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "File required" }, { status: 400 })
    }

    // In production, you would use Tesseract.js or a cloud OCR service
    // For now, return a mock response structure
    const mockText = `
      Sellerie Equestre
      Date: ${new Date().toLocaleDateString("fr-FR")}
      
      Selle cuir 450.00€
      Tapis 35.00€
      Guêtres 28.50€
      
      Total: 513.50€
      TVA: 102.70€
    `

    const parsed = parseReceiptText(mockText)

    return NextResponse.json({
      text: mockText,
      parsed,
      debug: {
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error) {
    console.error("[v0] OCR error:", error)
    return NextResponse.json({ error: "OCR processing failed" }, { status: 500 })
  }
}
