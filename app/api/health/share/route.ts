import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      // Mock response for preview environment
      const mockToken = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
      const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://cavaly.app"}/share/health/${mockToken}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

      return NextResponse.json({
        url,
        qrUrl,
        expiresAt,
        mock: true,
      })
    }

    const { horseId, expiresInHours = 72 } = await req.json()

    const supabase = await getSupabaseServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create share token
    const { data: token, error } = await supabase
      .from("health_share_tokens")
      .insert({
        horse_id: horseId,
        owner_id: user.id,
        scope: "health",
        expires_at: new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/share/health/${token.id}`

    // Generate QR code using a simple API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

    return NextResponse.json({
      url,
      qrUrl,
      expiresAt: token.expires_at,
    })
  } catch (error) {
    console.error("[v0] Health share error:", error)
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}
