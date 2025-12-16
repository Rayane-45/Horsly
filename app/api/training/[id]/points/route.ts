import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { GPSPoint } from "@/lib/integrations/types"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { points }: { points: GPSPoint[] } = await req.json()

    const supabase = await getSupabaseServerClient()

    // Get existing session
    const { data: session } = await supabase.from("training_sessions").select("points").eq("id", id).single()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Append new points
    const updatedPoints = [...(session.points || []), ...points]

    const { error } = await supabase.from("training_sessions").update({ points: updatedPoints }).eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true, pointCount: updatedPoints.length })
  } catch (error) {
    console.error("[v0] Training points error:", error)
    return NextResponse.json({ error: "Failed to add points" }, { status: 500 })
  }
}
