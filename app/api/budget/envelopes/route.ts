import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/budget/envelopes - Récupérer toutes les enveloppes budgétaires
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

    const { data: envelopes, error } = await supabase
      .from("budget_envelopes")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true })

    if (error) {
      // Si la table n'existe pas, retourner un tableau vide
      if (error.code === "42P01") {
        return NextResponse.json({ envelopes: [] })
      }
      console.error("Error fetching envelopes:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ envelopes: envelopes || [] })
  } catch (error: any) {
    console.error("Error in GET /api/budget/envelopes:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/budget/envelopes - Créer une nouvelle enveloppe
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
    const { category, monthly_budget } = body

    if (!category || monthly_budget === undefined) {
      return NextResponse.json({ error: "Catégorie et budget mensuel requis" }, { status: 400 })
    }

    // Vérifier si une enveloppe existe déjà pour cette catégorie
    const { data: existing } = await supabase
      .from("budget_envelopes")
      .select("id")
      .eq("user_id", user.id)
      .eq("category", category)
      .single()

    if (existing) {
      // Mettre à jour l'enveloppe existante
      const { data: envelope, error } = await supabase
        .from("budget_envelopes")
        .update({ monthly_budget, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating envelope:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ envelope })
    }

    // Créer une nouvelle enveloppe
    const { data: envelope, error } = await supabase
      .from("budget_envelopes")
      .insert({
        user_id: user.id,
        category,
        monthly_budget,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating envelope:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ envelope }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/budget/envelopes:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
