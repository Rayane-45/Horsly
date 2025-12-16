"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Share2, Copy, CheckCircle2, Loader2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface ShareHealthRecordProps {
  horseId: string
}

export function ShareHealthRecord({ horseId }: ShareHealthRecordProps) {
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareData, setShareData] = useState<{ url: string; token: string; expiresAt: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [duration, setDuration] = useState("72") // hours

  const generateShareLink = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/health/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horseId,
          durationHours: Number.parseInt(duration),
        }),
      })

      if (!response.ok) throw new Error("Failed to generate share link")

      const data = await response.json()
      setShareData(data)
    } catch (error) {
      console.error("[v0] Error generating share link:", error)
      alert("Erreur lors de la génération du lien de partage")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (!shareData) return
    navigator.clipboard.writeText(shareData.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Partager le carnet
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Partager le carnet de santé</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!shareData ? (
            <>
              <p className="text-sm text-muted-foreground">
                Générez un lien sécurisé pour partager le carnet de santé avec un vétérinaire ou un acheteur potentiel.
              </p>

              <div>
                <Label htmlFor="duration">Durée de validité</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="72"
                  suffix="heures"
                />
                <p className="text-xs text-muted-foreground mt-1">Le lien expirera après cette durée</p>
              </div>

              <Button onClick={generateShareLink} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Générer le lien
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Lien généré avec succès</span>
                </div>
                <p className="text-sm text-green-700">
                  Expire le {new Date(shareData.expiresAt).toLocaleDateString("fr-FR")} à{" "}
                  {new Date(shareData.expiresAt).toLocaleTimeString("fr-FR")}
                </p>
              </Card>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <QRCodeSVG value={shareData.url} size={200} />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label>Lien de partage</Label>
                <div className="flex gap-2">
                  <Input value={shareData.url} readOnly className="font-mono text-xs" />
                  <Button size="icon" variant="outline" onClick={copyToClipboard}>
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShareData(null)} className="flex-1">
                  Nouveau lien
                </Button>
                <Button onClick={() => setOpen(false)} className="flex-1">
                  Fermer
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
