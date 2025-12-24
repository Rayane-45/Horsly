import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/training/sessions - Récupérer toutes les séances d'entraînement
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const horseId = searchParams.get("horseId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = supabase
      .from("training_sessions")
      .select("*, horses(name, id)")
      .eq("user_id", user.id)
      .order("start_time", { ascending: false })

    if (horseId) {
      query = query.eq("horse_id", horseId)
    }
    if (startDate) {
      query = query.gte("start_time", startDate)
    }
    if (endDate) {
      query = query.lte("start_time", endDate)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error("Error fetching training sessions:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sessions })
  } catch (error: any) {
    console.error("Error in GET /api/training/sessions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/training/sessions - Créer une nouvelle séance d'entraînement
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const sessionData = {
      ...body,
      user_id: user.id,
    }

    const { data: session, error } = await supabase
      .from("training_sessions")
      .insert([sessionData])
      .select("*, horses(name, id)")
      .single()

    if (error) {
      console.error("Error creating training session:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/training/sessions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
