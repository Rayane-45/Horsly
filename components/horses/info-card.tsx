"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, FileText, Edit } from "lucide-react"

interface InfoCardProps {
  location?: string
  vetName?: string
  vetPhone?: string
  chipId?: string
  notes?: string
  onEdit?: () => void
}

export function InfoCard({ location, vetName, vetPhone, chipId, notes, onEdit }: InfoCardProps) {
  return (
    <Card className="p-4 bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Informations</h3>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-2">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Localisation</p>
              <p className="text-sm text-foreground">{location}</p>
            </div>
          </div>
        )}

        {(vetName || vetPhone) && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Vétérinaire</p>
              {vetName && <p className="text-sm text-foreground font-medium">{vetName}</p>}
              {vetPhone && (
                <a href={`tel:${vetPhone}`} className="text-xs text-primary hover:underline">
                  {vetPhone}
                </a>
              )}
            </div>
          </div>
        )}

        {chipId && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Puce électronique</p>
              <p className="text-sm text-foreground font-mono">{chipId}</p>
            </div>
          </div>
        )}

        {notes && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground line-clamp-3">{notes}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
