import type { OCRResult } from "./types"

export function parseReceiptText(text: string): OCRResult["parsed"] {
  // Naive parsing with regex + heuristics
  const totalMatch = text.match(/total\s*[:-]?\s*([\d.,]+)\s*(€|eur|usd)?/i)
  const dateMatch = text.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/)
  const tvaMatch = text.match(/(tva|tax)\s*[:-]?\s*([\d.,]+)/i)

  // Extract merchant from first non-empty line
  const lines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  const merchant = lines[0]?.slice(0, 80) || null

  // Try to extract line items (simple heuristic)
  const items: Array<{ name: string; price: string }> = []
  const itemPattern = /(.+?)\s+([\d.,]+)\s*€?/g
  let match
  while ((match = itemPattern.exec(text)) !== null) {
    if (match[1] && match[2] && match[1].length < 50) {
      items.push({ name: match[1].trim(), price: match[2] })
    }
  }

  return {
    date: dateMatch?.[1] || null,
    total: totalMatch?.[1]?.replace(",", ".") || null,
    tax: tvaMatch?.[2]?.replace(",", ".") || null,
    merchant,
    items: items.slice(0, 10), // Limit to 10 items
  }
}
