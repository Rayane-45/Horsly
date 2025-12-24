import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/expenses - Récupérer toutes les dépenses de l'utilisateur
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")

    let query = supabase
      .from("expenses")
      .select("*, horses(name)")
      .eq("user_id", user.id)
      .order("expense_date", { ascending: false })

    if (startDate) {
      query = query.gte("expense_date", startDate)
    }
    if (endDate) {
      query = query.lte("expense_date", endDate)
    }
    if (category) {
      query = query.eq("category", category)
    }

    const { data: expenses, error } = await query

    if (error) {
      console.error("Error fetching expenses:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expenses })
  } catch (error: any) {
    console.error("Error in GET /api/expenses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/expenses - Créer une nouvelle dépense
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
    const expenseData = {
      ...body,
      user_id: user.id,
    }

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert([expenseData])
      .select("*, horses(name)")
      .single()

    if (error) {
      console.error("Error creating expense:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/expenses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
