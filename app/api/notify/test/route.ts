import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, sendSMS } from "@/lib/integrations/notify"

export async function POST(req: NextRequest) {
  try {
    const { type, to, message } = await req.json()

    if (type === "email") {
      await sendEmail({
        toEmail: to,
        subject: "Test from Cavaly",
        text: message,
      })
    } else if (type === "sms") {
      await sendSMS({
        toPhone: to,
        text: message,
      })
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Notification test error:", error)
    return NextResponse.json({ error: "Notification failed" }, { status: 500 })
  }
}
