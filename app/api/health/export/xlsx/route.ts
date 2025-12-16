import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const horseId = req.nextUrl.searchParams.get("horseId")

    if (!horseId) {
      return NextResponse.json({ error: "Horse ID required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch health records
    const { data: records } = await supabase
      .from("care_events")
      .select("*")
      .eq("horse_id", horseId)
      .order("date", { ascending: false })

    // In production, use ExcelJS to generate proper XLSX
    // For now, generate CSV
    const csv = [
      "Date,Type,Provider,Notes,Cost",
      ...(records || []).map((r) =>
        [r.date, r.type, r.provider || "", r.notes?.replace(/,/g, ";") || "", r.cost || ""].join(","),
      ),
    ].join("\n")

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=carnet-sante-${horseId}.csv`,
      },
    })
  } catch (error) {
    console.error("[v0] Health export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
