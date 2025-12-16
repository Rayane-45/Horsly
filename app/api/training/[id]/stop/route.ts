import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { GPSPoint, Gait } from "@/lib/integrations/types"
import { GaitDetector } from "@/lib/integrations/gait-detector"

function calculateDistance(points: GPSPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1]
    const p2 = points[i]
    // Haversine formula
    const R = 6371 // Earth radius in km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180
    const dLon = ((p2.lon - p1.lon) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    total += R * c
  }
  return total
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await getSupabaseServerClient()

    // Get session
    const { data: session } = await supabase.from("training_sessions").select("*").eq("id", id).single()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const points: GPSPoint[] = session.points || []
    const endTime = new Date()
    const startTime = new Date(session.start_time)
    const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60 // minutes

    // Calculate stats
    const distance = calculateDistance(points)
    const avgSpeed = duration > 0 ? (distance / duration) * 60 : 0 // km/h

    // Analyze gaits
    const detector = new GaitDetector()
    const gaitBreakdown: Record<Gait, number> = {
      idle: 0,
      walk: 0,
      trot: 0,
      canter: 0,
      gallop: 0,
    }

    points.forEach((p) => {
      if (p.speed) {
        const gait = detector.update(p.speed)
        gaitBreakdown[gait]++
      }
    })

    // Update session
    const { error } = await supabase
      .from("training_sessions")
      .update({
        end_time: endTime.toISOString(),
        status: "completed",
        distance,
        duration,
        avg_speed: avgSpeed,
        gait_breakdown: gaitBreakdown,
      })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      stats: {
        distance,
        duration,
        avgSpeed,
        gaitBreakdown,
      },
    })
  } catch (error) {
    console.error("[v0] Training stop error:", error)
    return NextResponse.json({ error: "Failed to stop session" }, { status: 500 })
  }
}
