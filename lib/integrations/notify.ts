import type { NotifyPayload } from "./types"

export async function sendEmail(payload: NotifyPayload) {
  if (!payload.toEmail) throw new Error("Email address required")

  // Using Resend API (free tier available)
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cavaly <noreply@cavaly.app>",
        to: [payload.toEmail],
        subject: payload.subject ?? "Cavaly",
        text: payload.text,
        html: payload.html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Email failed: ${error}`)
    }

    return await res.json()
  }

  // Fallback: log to console in development
  console.log("[v0] Email would be sent:", payload)
  return { success: true, mode: "dev" }
}

export async function sendSMS(payload: NotifyPayload) {
  if (!payload.toPhone) throw new Error("Phone number required")

  // Using Twilio (requires paid account, no-op in dev)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: payload.toPhone,
          From: process.env.TWILIO_PHONE_NUMBER,
          Body: payload.text,
        }),
      },
    )

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`SMS failed: ${error}`)
    }

    return await res.json()
  }

  // No-op in development
  console.log("[v0] SMS would be sent:", payload)
  return { success: true, mode: "dev" }
}
