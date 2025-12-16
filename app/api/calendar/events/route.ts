import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { horseId, title, description, startISO, endISO, attendeesEmails } = await req.json()

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's Google Calendar tokens
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "google_calendar")
      .single()

    if (!integration) {
      return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 })
    }

    // Create calendar event
    const eventResponse = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: title,
        description,
        start: { dateTime: startISO },
        end: { dateTime: endISO },
        attendees: (attendeesEmails || []).map((email: string) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 60 },
          ],
        },
        extendedProperties: {
          private: { horseId },
        },
      }),
    })

    if (!eventResponse.ok) {
      throw new Error("Failed to create calendar event")
    }

    const event = await eventResponse.json()

    return NextResponse.json({ id: event.id, link: event.htmlLink })
  } catch (error) {
    console.error("[v0] Calendar event creation error:", error)
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 })
  }
}
