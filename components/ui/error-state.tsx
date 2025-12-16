"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "./button"
import { Alert, AlertDescription, AlertTitle } from "./alert"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = "Une erreur est survenue", message, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-3 bg-transparent">
            Réessayer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
