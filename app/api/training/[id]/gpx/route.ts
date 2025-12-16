import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { generateGPX } from "@/lib/integrations/gpx-export"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await getSupabaseServerClient()

    const { data: session } = await supabase.from("training_sessions").select("*, horses(name)").eq("id", id).single()

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const horseName = session.horses?.name || "Unknown"
    const sessionName = `${horseName} - ${new Date(session.start_time).toLocaleDateString()}`
    const gpx = generateGPX(session.points || [], sessionName)

    return new Response(gpx, {
      headers: {
        "Content-Type": "application/gpx+xml",
        "Content-Disposition": `attachment; filename=session-${id}.gpx`,
      },
    })
  } catch (error) {
    console.error("[v0] GPX export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
