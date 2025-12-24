import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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
  // La DB a DECIMAL(4,2) limitant à 99.99 - on stocke en mètres
  if (sanitized.height !== undefined && sanitized.height !== null && sanitized.height !== '') {
    const height = Number(sanitized.height)
    if (isNaN(height) || height < 0) {
      return { valid: false, error: "La taille doit être un nombre positif", sanitized }
    }
    // Si > 10, c'est en cm, on convertit en mètres
    if (height > 10) {
      sanitized.height = Math.round((height / 100) * 100) / 100
    } else {
      sanitized.height = Math.round(height * 100) / 100
    }
  }
  
  // Validation du poids (weight) - max 999.99 kg avec DECIMAL(5,2)
  if (sanitized.weight !== undefined && sanitized.weight !== null && sanitized.weight !== '') {
    const weight = Number(sanitized.weight)
    if (isNaN(weight) || weight < 0) {
      return { valid: false, error: "Le poids doit être un nombre positif", sanitized }
    }
    if (weight > 999.99) {
      return { valid: false, error: "Le poids ne peut pas dépasser 999.99 kg", sanitized }
    }
    sanitized.weight = Math.round(weight * 100) / 100
  }
  
  // Validation du nom (requis pour la création)
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

// GET /api/horses - Récupérer tous les chevaux de l'utilisateur
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

    const { data: horses, error } = await supabase
      .from("horses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching horses:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ horses })
  } catch (error: any) {
    console.error("Error in GET /api/horses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/horses - Créer un nouveau cheval
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
    
    // Valider et nettoyer les données
    const { valid, error: validationError, sanitized } = validateHorseData(body)
    if (!valid) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }
    
    // Vérifier que le nom est fourni
    if (!sanitized.name) {
      return NextResponse.json({ error: "Le nom du cheval est requis" }, { status: 400 })
    }
    
    const horseData = {
      ...sanitized,
      user_id: user.id,
    }

    const { data: horse, error } = await supabase
      .from("horses")
      .insert([horseData])
      .select()
      .single()

    if (error) {
      console.error("Error creating horse:", error)
      // Messages d'erreur plus clairs
      if (error.code === '22003') {
        return NextResponse.json({ 
          error: "Une valeur numérique dépasse la limite autorisée. Vérifiez la taille et le poids." 
        }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ horse }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/horses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
