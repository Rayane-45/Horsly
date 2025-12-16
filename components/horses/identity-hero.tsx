"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Heart, AlertCircle } from "lucide-react"

interface IdentityHeroProps {
  name: string
  breed: string
  image?: string
  healthStatus: "healthy" | "attention" | "critical"
  onPhotoChange?: (file: File) => void
}

export function IdentityHero({ name, breed, image, healthStatus, onPhotoChange }: IdentityHeroProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Format non supporté. Utilisez JPG, PNG ou WebP.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Fichier trop volumineux. Maximum 5 Mo.")
      return
    }

    setIsUploading(true)
    try {
      onPhotoChange?.(file)
    } finally {
      setIsUploading(false)
    }
  }

  const statusConfig = {
    healthy: { label: "Santé OK", icon: Heart, className: "bg-secondary/20 text-secondary border-secondary/30" },
    attention: {
      label: "Attention",
      icon: AlertCircle,
      className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    },
    critical: {
      label: "Urgent",
      icon: AlertCircle,
      className: "bg-destructive/20 text-destructive border-destructive/30",
    },
  }

  const config = statusConfig[healthStatus]
  const StatusIcon = config.icon

  return (
    <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden bg-muted">
      <Image
        src={image || "/placeholder.svg?height=320&width=1200&query=horse portrait"}
        alt={name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className={`${config.className} backdrop-blur-sm`}>
                <StatusIcon className="h-3 w-3 mr-1 fill-current" />
                {config.label}
              </Badge>
              <span className="text-sm text-muted-foreground">{breed}</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              id="photo-upload"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label htmlFor="photo-upload">
              <Button
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg cursor-pointer"
                disabled={isUploading}
                asChild
              >
                <span>
                  <Camera className="h-4 w-4" />
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
