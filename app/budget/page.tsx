"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Settings, BarChart3, Upload } from "lucide-react"
import { OperationFormDialog } from "@/components/budget/operation-form-dialog"
import { OperationsFilters } from "@/components/budget/operations-filters"
import { OperationsTable } from "@/components/budget/operations-table"
import { BudgetEnvelopes } from "@/components/budget/budget-envelopes"
import { BudgetAlerts } from "@/components/budget/budget-alerts"
import { AutomationRules } from "@/components/budget/automation-rules"
import { ForecastingSimulator } from "@/components/budget/forecasting-simulator"
import { ImportExportDialog } from "@/components/budget/import-export-dialog"
import { IntegrationSettings } from "@/components/budget/integration-settings"
import { useBudgetStore } from "@/lib/budget/store"
import { applyOperationFilters } from "@/lib/budget/filters"
import { calculatePeriodSummary } from "@/lib/budget/calculations"
import { AppLayout } from "@/components/layout/app-layout"
import { OCRReceiptScanner } from "@/components/budget/ocr-receipt-scanner"
import { useState } from "react"

export default function BudgetPage() {
  const { operations, filters, categories } = useBudgetStore()
  const [ocrScannerOpen, setOcrScannerOpen] = useState(false)

  // Current month period
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Previous month for comparison
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const filteredOperations = applyOperationFilters(operations, filters)
  const currentSummary = calculatePeriodSummary(operations, periodStart, periodEnd)
  const previousSummary = calculatePeriodSummary(operations, prevMonthStart, prevMonthEnd)

  const percentageChange =
    previousSummary.totalExpenses > 0
      ? ((currentSummary.totalExpenses - previousSummary.totalExpenses) / previousSummary.totalExpenses) * 100
      : 0

  const currentMonth = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  return (
    <AppLayout pageTitle="Budget" pageSubtitle="Gestion financière et suivi des dépenses équestres">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">Dépenses</span>
            </div>
            <p className="text-2xl font-semibold text-destructive">{currentSummary.totalExpenses.toFixed(0)}€</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentSummary.operationCount} opération{currentSummary.operationCount > 1 ? "s" : ""}
            </p>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Revenus</span>
            </div>
            <p className="text-2xl font-semibold text-secondary">{currentSummary.totalIncome.toFixed(0)}€</p>
            <p className="text-xs text-muted-foreground mt-1">
              +{currentSummary.totalRefunds.toFixed(0)}€ remboursements
            </p>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">Solde net</span>
            </div>
            <p
              className={`text-2xl font-semibold ${currentSummary.netBalance >= 0 ? "text-secondary" : "text-destructive"}`}
            >
              {currentSummary.netBalance >= 0 ? "+" : ""}
              {currentSummary.netBalance.toFixed(0)}€
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Moyenne {(currentSummary.totalExpenses / now.getDate()).toFixed(0)}€/jour
            </p>
          </Card>

          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Settings className="h-4 w-4" />
              <span className="text-xs font-medium">Catégories</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{currentSummary.categoriesUsed}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentSummary.uncategorized} non catégorisée{currentSummary.uncategorized > 1 ? "s" : ""}
            </p>
          </Card>
        </div>

        {/* Alerts */}
        <BudgetAlerts />

        {/* Main Content Tabs */}
        <Tabs defaultValue="operations" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="operations">Opérations</TabsTrigger>
              <TabsTrigger value="envelopes">Enveloppes</TabsTrigger>
              <TabsTrigger value="automation">Automatisation</TabsTrigger>
              <TabsTrigger value="forecasting">Prévisions</TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyses
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button onClick={() => setOcrScannerOpen(true)} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Scanner un reçu
              </Button>
              <ImportExportDialog />
              <OperationFormDialog />
            </div>
          </div>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <OperationsFilters />
              </div>
              <div className="lg:col-span-3">
                <OperationsTable />
              </div>
            </div>
          </TabsContent>

          {/* Envelopes Tab */}
          <TabsContent value="envelopes">
            <BudgetEnvelopes />
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation">
            <AutomationRules />
          </TabsContent>

          {/* Forecasting Tab */}
          <TabsContent value="forecasting">
            <ForecastingSimulator />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Évolution mensuelle</h3>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Graphique d'évolution (à implémenter avec Recharts)
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Répartition par catégorie</h3>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Graphique en camembert (à implémenter avec Recharts)
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Dépenses par cheval</h3>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Graphique comparatif (à implémenter avec Recharts)
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tendances annuelles</h3>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Graphique de tendance (à implémenter avec Recharts)
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <IntegrationSettings />

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Comptes bancaires</h3>
              <p className="text-sm text-muted-foreground mb-4">Gérez vos comptes et cartes bancaires</p>
              <Button variant="outline" className="border-border bg-transparent">
                Gérer les comptes
              </Button>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Catégories</h3>
              <p className="text-sm text-muted-foreground mb-4">Personnalisez vos catégories de dépenses</p>
              <Button variant="outline" className="border-border bg-transparent">
                Gérer les catégories
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <OCRReceiptScanner open={ocrScannerOpen} onOpenChange={setOcrScannerOpen} />
    </AppLayout>
  )
}
