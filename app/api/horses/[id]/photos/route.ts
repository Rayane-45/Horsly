import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/horses/[id]/photos - Récupérer toutes les photos d'un cheval
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

    const horseId = params.id

    // Vérifier que le cheval appartient à l'utilisateur
    const { data: horse, error: horseError } = await supabase
      .from("horses")
      .select("id")
      .eq("id", horseId)
      .eq("user_id", user.id)
      .single()

    if (horseError || !horse) {
      return NextResponse.json({ error: "Cheval non trouvé" }, { status: 404 })
    }

    // Récupérer les photos
    const { data: photos, error } = await supabase
      .from("horse_photos")
      .select("*")
      .eq("horse_id", horseId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching photos:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ photos: photos || [] })
  } catch (error: any) {
    console.error("Error in GET /api/horses/[id]/photos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/horses/[id]/photos - Ajouter une photo à l'album
export async function POST(
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

    const horseId = params.id
    const body = await request.json()
    const { url, storage_path, media_type, caption } = body

    if (!url || !storage_path) {
      return NextResponse.json(
        { error: "URL et storage_path requis" },
        { status: 400 }
      )
    }

    if (media_type && !['image', 'video'].includes(media_type)) {
      return NextResponse.json(
        { error: "media_type doit être 'image' ou 'video'" },
        { status: 400 }
      )
    }

    // Vérifier que le cheval appartient à l'utilisateur
    const { data: horse, error: horseError } = await supabase
      .from("horses")
      .select("id")
      .eq("id", horseId)
      .eq("user_id", user.id)
      .single()

    if (horseError || !horse) {
      return NextResponse.json({ error: "Cheval non trouvé" }, { status: 404 })
    }

    // Insérer la photo/vidéo
    const { data: photo, error } = await supabase
      .from("horse_photos")
      .insert({
        horse_id: horseId,
        user_id: user.id,
        url,
        storage_path,
        media_type: media_type || 'image',
        caption: caption || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting photo:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/horses/[id]/photos:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
