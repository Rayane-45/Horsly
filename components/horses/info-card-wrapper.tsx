"use client"

import { InfoCard } from "./info-card"

interface InfoCardWrapperProps {
  location?: string
  vetName?: string
  vetPhone?: string
  chipId?: string
  notes?: string
}

export function InfoCardWrapper({ location, vetName, vetPhone, chipId, notes }: InfoCardWrapperProps) {
  const handleEdit = () => {
    console.log("[v0] Edit horse info")
    // TODO: Implement actual edit logic here
  }

  return (
    <InfoCard
      location={location}
      vetName={vetName}
      vetPhone={vetPhone}
      chipId={chipId}
      notes={notes}
      onEdit={handleEdit}
    />
  )
}
