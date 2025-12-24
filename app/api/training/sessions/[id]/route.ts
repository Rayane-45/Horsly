import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/training/sessions/[id] - Récupérer une séance spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { data: session, error } = await supabase
      .from("training_sessions")
      .select("*, horses(name, id)")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching training session:", error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error("Error in GET /api/training/sessions/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/training/sessions/[id] - Mettre à jour une séance
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: session, error } = await supabase
      .from("training_sessions")
      .update(body)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*, horses(name, id)")
      .single()

    if (error) {
      console.error("Error updating training session:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error("Error in PATCH /api/training/sessions/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/training/sessions/[id] - Supprimer une séance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { error } = await supabase
      .from("training_sessions")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting training session:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/training/sessions/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
