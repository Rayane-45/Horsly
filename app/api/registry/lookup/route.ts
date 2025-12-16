import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const sire = req.nextUrl.searchParams.get("sire")
    const ueln = req.nextUrl.searchParams.get("ueln")

    if (!sire && !ueln) {
      return NextResponse.json({ error: "SIRE or UELN required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    let query = supabase.from("registry_equids").select("*")

    if (ueln) {
      query = query.eq("ueln", ueln)
    } else if (sire) {
      query = query.eq("sire", sire)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json({ match: false })
    }

    return NextResponse.json({ match: true, data })
  } catch (error) {
    console.error("[v0] Registry lookup error:", error)
    return NextResponse.json({ match: false })
  }
}
