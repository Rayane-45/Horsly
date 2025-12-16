import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { horseId, type, notes } = await req.json()

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: session, error } = await supabase
      .from("training_sessions")
      .insert({
        horse_id: horseId,
        user_id: user.id,
        type,
        notes,
        start_time: new Date().toISOString(),
        status: "live",
        points: [],
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ id: session.id, startTime: session.start_time })
  } catch (error) {
    console.error("[v0] Training start error:", error)
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 })
  }
}
