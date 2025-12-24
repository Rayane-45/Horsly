import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/horses/[id] - Récupérer un cheval spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { data: horse, error } = await supabase
      .from("horses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching horse:", error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ horse })
  } catch (error: any) {
    console.error("Error in GET /api/horses/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Validation des données du cheval
function validateHorseData(body: Record<string, unknown>): { valid: boolean; error?: string; sanitized: Record<string, unknown> } {
  const sanitized: Record<string, unknown> = {}
  
  // Copier les champs valides
  const allowedFields = ['name', 'breed', 'birth_date', 'color', 'gender', 'height', 'weight', 
                         'microchip_number', 'registration_number', 'sire_name', 'dam_name', 
                         'image_url', 'notes']
  
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      sanitized[field] = body[field]
    }
  }
  
  // Validation de la taille (height)
  // Note: La DB a DECIMAL(4,2) limitant à 99.99 - on stocke en mètres à la place
  // Si la valeur semble être en cm (> 10), on la convertit en mètres
  if (sanitized.height !== undefined && sanitized.height !== null) {
    const height = Number(sanitized.height)
    if (isNaN(height) || height < 0) {
      return { valid: false, error: "La taille doit être un nombre positif", sanitized }
    }
    // Si > 10, c'est probablement en cm, on convertit en mètres
    if (height > 10) {
      sanitized.height = Math.round((height / 100) * 100) / 100 // Ex: 165 -> 1.65
    } else if (height > 3) {
      // Entre 3 et 10, probablement une erreur ou déjà en mètres avec mauvaise précision
      sanitized.height = Math.round(height * 100) / 100
    } else {
      sanitized.height = Math.round(height * 100) / 100
    }
  }
  
  // Validation du poids (weight) - max 999.99 kg avec DECIMAL(5,2)
  if (sanitized.weight !== undefined && sanitized.weight !== null) {
    const weight = Number(sanitized.weight)
    if (isNaN(weight) || weight < 0) {
      return { valid: false, error: "Le poids doit être un nombre positif", sanitized }
    }
    if (weight > 999.99) {
      return { valid: false, error: "Le poids ne peut pas dépasser 999.99 kg", sanitized }
    }
    sanitized.weight = Math.round(weight * 100) / 100
  }
  
  // Validation du nom
  if (sanitized.name !== undefined) {
    if (typeof sanitized.name !== 'string' || sanitized.name.trim().length === 0) {
      return { valid: false, error: "Le nom est requis", sanitized }
    }
    sanitized.name = sanitized.name.trim()
  }
  
  // Validation du genre
  if (sanitized.gender !== undefined && sanitized.gender !== null && sanitized.gender !== '') {
    const validGenders = ['male', 'female', 'gelding']
    if (!validGenders.includes(sanitized.gender as string)) {
      return { valid: false, error: "Genre invalide", sanitized }
    }
  }
  
  return { valid: true, sanitized }
}

// PATCH /api/horses/[id] - Mettre à jour un cheval
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    
    // Valider et nettoyer les données
    const { valid, error: validationError, sanitized } = validateHorseData(body)
    if (!valid) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const { data: horse, error } = await supabase
      .from("horses")
      .update(sanitized)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating horse:", error)
      // Messages d'erreur plus clairs
      if (error.code === '22003') {
        return NextResponse.json({ 
          error: "Une valeur numérique dépasse la limite autorisée. Vérifiez la taille et le poids." 
        }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ horse })
  } catch (error: any) {
    console.error("Error in PATCH /api/horses/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/horses/[id] - Supprimer un cheval
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { error } = await supabase
      .from("horses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting horse:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/horses/[id]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
