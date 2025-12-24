import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Client admin pour accéder à la table profiles sans RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json()

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Identifiant requis" },
        { status: 400 }
      )
    }

    const trimmedIdentifier = identifier.trim().toLowerCase()

    // Si c'est un email (contient @), retourner tel quel
    if (trimmedIdentifier.includes("@")) {
      return NextResponse.json({ email: trimmedIdentifier })
    }

    // Sinon, c'est un pseudo - chercher l'email correspondant
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("username", trimmedIdentifier)
      .single()

    if (error || !profile?.email) {
      return NextResponse.json(
        { error: "Pseudo non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ email: profile.email })
  } catch (error: any) {
    console.error("Error resolving identifier:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
