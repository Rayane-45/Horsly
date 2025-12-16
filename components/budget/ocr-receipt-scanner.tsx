"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"

interface OCRReceiptScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OCRReceiptScanner({ open, onOpenChange }: OCRReceiptScannerProps) {
  const { addOperation } = useBudgetStore()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<{
    text: string
    parsed: { amount?: number; date?: string; merchant?: string }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [merchant, setMerchant] = useState("")
  const [category, setCategory] = useState("")
  const [notes, setNotes] = useState("")

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)

    // Process with OCR
    await processOCR(selectedFile)
  }

  const processOCR = async (file: File) => {
    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/ocr/receipt", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Échec de l'OCR")
      }

      const result = await response.json()
      setOcrResult(result)

      // Pre-fill form with parsed data
      if (result.parsed.amount) setAmount(result.parsed.amount.toString())
      if (result.parsed.date) setDate(result.parsed.date)
      if (result.parsed.merchant) setMerchant(result.parsed.merchant)
    } catch (err) {
      console.error("[v0] OCR error:", err)
      setError("Impossible de lire le reçu. Veuillez remplir manuellement.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = () => {
    if (!amount || !date) {
      setError("Montant et date sont requis")
      return
    }

    // Create operation
    addOperation({
      id: `op-${Date.now()}`,
      date,
      label: merchant || "Dépense",
      amount: Number.parseFloat(amount),
      type: "EXPENSE",
      categoryId: category || "uncategorized",
      accountId: "account-1",
      status: "CLEARED",
      source: "MANUAL",
      attachments: file ? [{ name: file.name, url: preview || "", type: file.type }] : [],
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Reset and close
    setFile(null)
    setPreview(null)
    setOcrResult(null)
    setAmount("")
    setDate("")
    setMerchant("")
    setCategory("")
    setNotes("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scanner un reçu</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          {!file && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Importez une photo ou un PDF de votre reçu</p>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="max-w-xs mx-auto"
              />
            </div>
          )}

          {/* Preview & Processing */}
          {file && (
            <div className="space-y-4">
              {preview && (
                <Card className="p-4">
                  <img src={preview || "/placeholder.svg"} alt="Receipt preview" className="max-h-64 mx-auto rounded" />
                </Card>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyse du reçu en cours...</span>
                </div>
              )}

              {ocrResult && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Reçu analysé avec succès</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Les champs ont été pré-remplis. Vérifiez et corrigez si nécessaire.
                  </p>
                </Card>
              )}

              {error && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Form */}
          {file && !isProcessing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Montant *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="merchant">Fournisseur</Label>
                <Input
                  id="merchant"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Nom du fournisseur"
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Maréchalerie, Vétérinaire..."
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes additionnelles..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>Enregistrer</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
