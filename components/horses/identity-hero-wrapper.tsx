"use client"

import { IdentityHero } from "./identity-hero"

interface IdentityHeroWrapperProps {
  name: string
  breed: string
  image?: string
  healthStatus: "healthy" | "attention" | "critical"
}

export function IdentityHeroWrapper({ name, breed, image, healthStatus }: IdentityHeroWrapperProps) {
  const handlePhotoChange = (file: File) => {
    console.log("[v0] Photo upload:", file.name)
    // TODO: Implement actual photo upload logic here
  }

  return (
    <IdentityHero
      name={name}
      breed={breed}
      image={image}
      healthStatus={healthStatus}
      onPhotoChange={handlePhotoChange}
    />
  )
}
