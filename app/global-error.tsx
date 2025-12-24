"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Une erreur s'est produite</h1>
              <p className="text-muted-foreground">
                Nous sommes désolés, quelque chose s'est mal passé. Veuillez réessayer.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"} className="w-full">
                Retour à l'accueil
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && error.message && (
              <details className="text-left text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer font-medium">Détails de l'erreur</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
