import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible", code: "SERVICE_UNAVAILABLE" }, { status: 503 })
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié", code: "UNAUTHORIZED" }, { status: 401 })
    }

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      // If profile doesn't exist (PGRST116 = no rows returned)
      if (profileError.code === "PGRST116") {
        // Return a specific code so client can create the profile
        return NextResponse.json(
          { error: "Profil non trouvé", code: "PROFILE_NOT_FOUND" },
          { status: 404 }
        )
      }

      console.error("Error fetching profile:", profileError)
      return NextResponse.json(
        { error: "Erreur lors du chargement du profil", code: "FETCH_ERROR", details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("Error in profile GET:", error)
    return NextResponse.json({ error: "Erreur serveur", code: "SERVER_ERROR", details: error.message }, { status: 500 })
  }
}

// POST: Create a new profile (called when profile doesn't exist)
export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible", code: "SERVICE_UNAVAILABLE" }, { status: 503 })
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié", code: "UNAUTHORIZED" }, { status: 401 })
    }

    // Use upsert to avoid conflicts (if profile was created by trigger or race condition)
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single()

    if (createError) {
      console.error("Error creating profile:", createError)
      return NextResponse.json(
        { error: "Erreur lors de la création du profil", code: "CREATE_ERROR", details: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: newProfile }, { status: 201 })
  } catch (error: any) {
    console.error("Error in profile POST:", error)
    return NextResponse.json({ error: "Erreur serveur", code: "SERVER_ERROR", details: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Service non disponible" }, { status: 500 })
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { username, display_name, bio, instagram, snapchat, linkedin, website, location } = body

    // Validate inputs
    if (username && username.length > 30) {
      return NextResponse.json(
        { error: "Le pseudo ne peut pas dépasser 30 caractères" },
        { status: 400 }
      )
    }

    if (username && !/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Le pseudo ne peut contenir que des lettres minuscules, chiffres et underscores" },
        { status: 400 }
      )
    }

    if (display_name && display_name.length > 50) {
      return NextResponse.json(
        { error: "Le nom d'affichage ne peut pas dépasser 50 caractères" },
        { status: 400 }
      )
    }

    if (bio && bio.length > 200) {
      return NextResponse.json(
        { error: "La bio ne peut pas dépasser 200 caractères" },
        { status: 400 }
      )
    }

    // Check if username is already taken (if provided)
    if (username) {
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: "Ce pseudo est déjà pris" },
          { status: 400 }
        )
      }
    }

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        username: username || null,
        display_name: display_name || null,
        bio: bio || null,
        instagram: instagram || null,
        snapchat: snapchat || null,
        linkedin: linkedin || null,
        website: website || null,
        location: location || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating profile:", updateError)
      // Check for unique constraint violation
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "Ce pseudo est déjà pris" },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du profil" },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error("Error in profile PATCH:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
