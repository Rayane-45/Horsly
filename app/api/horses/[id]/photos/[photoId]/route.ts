import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// DELETE /api/horses/[id]/photos/[photoId] - Supprimer une photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
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

    const { id: horseId, photoId } = params

    // Récupérer la photo pour obtenir le storage_path
    const { data: photo, error: fetchError } = await supabase
      .from("horse_photos")
      .select("*, horses!inner(user_id)")
      .eq("id", photoId)
      .eq("horse_id", horseId)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo non trouvée" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est propriétaire
    if (photo.horses.user_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Supprimer le fichier du storage
    if (photo.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("horse-images")
        .remove([photo.storage_path])

      if (storageError) {
        console.error("Error deleting from storage:", storageError)
        // On continue quand même pour supprimer l'entrée en base
      }
    }

    // Supprimer l'entrée en base de données
    const { error: deleteError } = await supabase
      .from("horse_photos")
      .delete()
      .eq("id", photoId)

    if (deleteError) {
      console.error("Error deleting photo:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/horses/[id]/photos/[photoId]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
