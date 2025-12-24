import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// PATCH /api/expenses/[id] - Mettre à jour une dépense
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

    const { data: expense, error } = await supabase
      .from("expenses")
      .update(body)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*, horses(name)")
      .single()

    if (error) {
      console.error("Error updating expense:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expense })
  } catch (error: any) {
    console.error("Error in PATCH /api/expenses/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/expenses/[id] - Supprimer une dépense
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
      .from("expenses")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting expense:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/expenses/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
