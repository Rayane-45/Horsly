import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/health/events - Récupérer tous les événements de santé
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
    const eventType = searchParams.get("eventType")

    let query = supabase
      .from("health_events")
      .select("*, horses(name, id)")
      .eq("user_id", user.id)
      .order("event_date", { ascending: false })

    if (horseId) {
      query = query.eq("horse_id", horseId)
    }
    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    const { data: events, error } = await query

    if (error) {
      console.error("Error fetching health events:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ events })
  } catch (error: any) {
    console.error("Error in GET /api/health/events:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/health/events - Créer un nouvel événement de santé
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
    const eventData = {
      ...body,
      user_id: user.id,
    }

    const { data: event, error } = await supabase
      .from("health_events")
      .insert([eventData])
      .select("*, horses(name, id)")
      .single()

    if (error) {
      console.error("Error creating health event:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/health/events:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
