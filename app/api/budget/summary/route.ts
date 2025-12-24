import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/budget/summary - Récupérer le résumé du budget
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
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

    // Récupérer le budget du mois
    const { data: budget } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year)
      .single()

    // Calculer les dépenses du mois
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount, category")
      .eq("user_id", user.id)
      .gte("expense_date", startDate)
      .lte("expense_date", endDate)

    const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0

    // Grouper par catégorie
    const byCategory: Record<string, number> = {}
    expenses?.forEach((exp) => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + Number(exp.amount)
    })

    return NextResponse.json({
      budget: budget?.planned_amount || 0,
      spent: totalExpenses,
      remaining: (budget?.planned_amount || 0) - totalExpenses,
      byCategory,
      categoryLimits: budget?.category_limits || {},
    })
  } catch (error: any) {
    console.error("Error in GET /api/budget/summary:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/budget/summary - Créer ou mettre à jour le budget du mois
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
    const { month, year, planned_amount, category_limits } = body

    const { data: budget, error } = await supabase
      .from("budgets")
      .upsert(
        {
          user_id: user.id,
          month,
          year,
          planned_amount,
          category_limits,
        },
        {
          onConflict: "user_id,month,year",
        }
      )
      .select()
      .single()

    if (error) {
      console.error("Error creating/updating budget:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ budget })
  } catch (error: any) {
    console.error("Error in POST /api/budget/summary:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
