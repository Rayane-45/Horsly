"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, Upload, FileText, FileSpreadsheet, FileDown } from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"
import { downloadCSV, generateExportSummary } from "@/lib/budget/export"
import { applyOperationFilters } from "@/lib/budget/filters"

export function ImportExportDialog() {
  const [open, setOpen] = useState(false)
  const { operations, categories, accounts, filters } = useBudgetStore()
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("csv")

  const filteredOperations = applyOperationFilters(operations, filters)
  const summary = generateExportSummary(filteredOperations)

  const handleExport = () => {
    if (exportFormat === "csv") {
      downloadCSV(filteredOperations, categories, accounts)
    } else if (exportFormat === "excel") {
      // Excel export would be implemented here
      alert("Export Excel en cours de développement")
    } else if (exportFormat === "pdf") {
      // PDF export would be implemented here
      alert("Export PDF en cours de développement")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border bg-transparent hover:bg-accent">
          <Download className="h-4 w-4 mr-2" />
          Importer / Exporter
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Import / Export</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Importez ou exportez vos données budgétaires
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 bg-muted/50">
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/10 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Données à exporter</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Opérations</p>
                  <p className="font-semibold text-foreground">{filteredOperations.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Période</p>
                  <p className="font-semibold text-foreground">
                    {summary.periodStart} - {summary.periodEnd}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total dépenses</p>
                  <p className="font-semibold text-destructive">-{summary.totalExpenses.toFixed(2)}€</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total revenus</p>
                  <p className="font-semibold text-secondary">+{summary.totalIncome.toFixed(2)}€</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">Format d'export</Label>
              <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as typeof exportFormat)}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">CSV</p>
                      <p className="text-xs text-muted-foreground">Compatible avec Excel, Google Sheets</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer flex-1">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Excel (.xlsx)</p>
                      <p className="text-xs text-muted-foreground">Format Microsoft Excel avec mise en forme</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer flex-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">PDF</p>
                      <p className="text-xs text-muted-foreground">Rapport imprimable avec graphiques</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleExport} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <FileDown className="h-4 w-4 mr-2" />
              Exporter {filteredOperations.length} opération{filteredOperations.length > 1 ? "s" : ""}
            </Button>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Formats supportés</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV (séparateur virgule ou point-virgule)</li>
                <li>• OFX (Open Financial Exchange)</li>
                <li>• MT940 (relevés bancaires)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-foreground">
                Fichier à importer
              </Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full border-border bg-transparent" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Sélectionner un fichier
                    <input id="file-upload" type="file" accept=".csv,.ofx,.mt940" className="hidden" />
                  </label>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Les doublons seront automatiquement détectés et ignorés</p>
            </div>

            <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
              <h4 className="text-sm font-medium text-foreground mb-2">Après l'import</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Vérification des doublons</li>
                <li>• Application des règles d'automatisation</li>
                <li>• Rapport détaillé des opérations importées</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
