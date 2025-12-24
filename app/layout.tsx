import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ExpensesProvider } from "@/contexts/expenses-context"
import { ProfileProvider } from "@/contexts/profile-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HorseCare - Gestion Équestre",
  description: "Application de gestion pour propriétaires de chevaux",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${jakarta.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <ProfileProvider>
            <ExpensesProvider>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              <Toaster />
            </ExpensesProvider>
          </ProfileProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
