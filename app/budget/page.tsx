"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Settings, BarChart3, Upload, Loader2, Trash2 } from "lucide-react"
import { OperationFormDialog } from "@/components/budget/operation-form-dialog"
import { OperationsFilters } from "@/components/budget/operations-filters"
import { BudgetEnvelopes } from "@/components/budget/budget-envelopes"
import { BudgetAlerts } from "@/components/budget/budget-alerts"
import { AutomationRules } from "@/components/budget/automation-rules"
import { ImportExportDialog } from "@/components/budget/import-export-dialog"
import { IntegrationSettings } from "@/components/budget/integration-settings"
import { AnalyticsSection } from "@/components/budget/analytics-section"
import { AppLayout } from "@/components/layout/app-layout"
import { OCRReceiptScanner } from "@/components/budget/ocr-receipt-scanner"
import { ChartLoadingSkeleton } from "@/components/loading-skeletons"
import { useExpensesContext, Expense } from "@/contexts/expenses-context"
import { useAuth } from "@/components/auth/auth-provider"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { Badge } from "@/components/ui/badge"
import { HorseSelector } from "@/components/horse-selector"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy components
const ForecastingSimulator = dynamic(
  () => import("@/components/budget/forecasting-simulator").then((mod) => ({ default: mod.ForecastingSimulator })),
  { loading: () => <ChartLoadingSkeleton />, ssr: false }
)

export default function BudgetPage() {
  const { user } = useAuth()
  const { expenses, loading, error, deleteExpense, refetch } = useExpensesContext()
  const [ocrScannerOpen, setOcrScannerOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedHorseId, setSelectedHorseId] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Current month period
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Previous month for comparison
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  // Calculate summary from real expenses
  const currentSummary = useMemo(() => {
    // Filter expenses by selected horse
    const currentMonthExpenses = expenses.filter((e) => {
      const date = new Date(e.expense_date)
      const isInPeriod = date >= periodStart && date <= periodEnd
      if (!isInPeriod) return false
      if (selectedHorseId === "all") return true
      return e.horse_id === selectedHorseId
    })

    const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const byCategory = currentMonthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)

    return {
      totalExpenses,
      totalIncome: 0,
      totalRefunds: 0,
      netBalance: -totalExpenses,
      operationCount: currentMonthExpenses.length,
      categoriesUsed: Object.keys(byCategory).length,
      uncategorized: currentMonthExpenses.filter((e) => !e.category || e.category === "autre").length,
      byCategory,
    }
  }, [expenses, periodStart, periodEnd, selectedHorseId])

  const previousSummary = useMemo(() => {
    // Filter expenses by selected horse
    const prevMonthExpenses = expenses.filter((e) => {
      const date = new Date(e.expense_date)
      const isInPeriod = date >= prevMonthStart && date <= prevMonthEnd
      if (!isInPeriod) return false
      if (selectedHorseId === "all") return true
      return e.horse_id === selectedHorseId
    })

    return {
      totalExpenses: prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0),
    }
  }, [expenses, prevMonthStart, prevMonthEnd, selectedHorseId])

  const filteredExpenses = useMemo(() => {
    let filtered = expenses
    
    // Filter by horse
    if (selectedHorseId !== "all") {
      filtered = filtered.filter((e) => e.horse_id === selectedHorseId)
    }
    
    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((e) => e.category === categoryFilter)
    }
    
    return filtered
  }, [expenses, categoryFilter, selectedHorseId])

  const categories = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category))
    return Array.from(cats).filter(Boolean)
  }, [expenses])

  const percentageChange =
    previousSummary.totalExpenses > 0
      ? ((currentSummary.totalExpenses - previousSummary.totalExpenses) / previousSummary.totalExpenses) * 100
      : 0

  const currentMonth = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  const handleDeleteExpense = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      try {
        await deleteExpense(id)
      } catch (err) {
        console.error("Erreur lors de la suppression:", err)
      }
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      // Format français (nouveau)
      alimentation: "Alimentation",
      veterinaire: "Vétérinaire",
      marechalerie: "Maréchalerie",
      equipement: "Équipement",
      pension: "Pension",
      transport: "Transport",
      competition: "Compétition",
      assurance: "Assurance",
      entrainement: "Entraînement",
      autre: "Autre",
      // Format anglais (ancien - compatibilité)
      vet: "Vétérinaire",
      farrier: "Maréchalerie",
      feed: "Alimentation",
      boarding: "Pension",
      training: "Entraînement",
      equipment: "Équipement",
      insurance: "Assurance",
      other: "Autre",
    }
    return labels[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      // Format français (nouveau)
      alimentation: "bg-green-100 text-green-800",
      veterinaire: "bg-red-100 text-red-800",
      marechalerie: "bg-orange-100 text-orange-800",
      equipement: "bg-blue-100 text-blue-800",
      pension: "bg-purple-100 text-purple-800",
      transport: "bg-yellow-100 text-yellow-800",
      competition: "bg-pink-100 text-pink-800",
      assurance: "bg-gray-100 text-gray-800",
      entrainement: "bg-cyan-100 text-cyan-800",
      autre: "bg-slate-100 text-slate-800",
      // Format anglais (ancien - compatibilité)
      vet: "bg-red-100 text-red-800",
      farrier: "bg-orange-100 text-orange-800",
      feed: "bg-green-100 text-green-800",
      boarding: "bg-purple-100 text-purple-800",
      training: "bg-cyan-100 text-cyan-800",
      equipment: "bg-blue-100 text-blue-800",
      insurance: "bg-gray-100 text-gray-800",
      other: "bg-slate-100 text-slate-800",
    }
    return colors[category] || "bg-slate-100 text-slate-800"
  }

  return (
    <AppLayout pageTitle="Budget" pageSubtitle="Gestion financière et suivi des dépenses équestres">
      <div className="space-y-6">
        {/* Horse Selector */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <HorseSelector
            value={selectedHorseId}
            onValueChange={setSelectedHorseId}
            showAllOption={true}
            label="Cheval"
          />
          <div className="text-sm text-muted-foreground">
            {currentMonth}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium">Dépenses</span>
            </div>
            {!mounted || loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-semibold text-destructive">{currentSummary.totalExpenses.toFixed(0)}€</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {currentSummary.operationCount} opération{currentSummary.operationCount > 1 ? "s" : ""}
                </p>
              </>
            )}
          </Card>

          <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium">Revenus</span>
            </div>
            {!mounted || loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-semibold text-secondary">{currentSummary.totalIncome.toFixed(0)}€</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  +{currentSummary.totalRefunds.toFixed(0)}€ remboursements
                </p>
              </>
            )}
          </Card>

          <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium">Solde net</span>
            </div>
            {!mounted || loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p
                  className={`text-xl sm:text-2xl font-semibold ${currentSummary.netBalance >= 0 ? "text-secondary" : "text-destructive"}`}
                >
                  {currentSummary.netBalance >= 0 ? "+" : ""}
                  {currentSummary.netBalance.toFixed(0)}€
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {now.getDate() > 0 ? `Moy. ${(currentSummary.totalExpenses / now.getDate()).toFixed(0)}€/j` : "0€/jour"}
                </p>
              </>
            )}
          </Card>

          <Card className="p-3 sm:p-4 bg-card border border-border aspect-square sm:aspect-auto flex flex-col justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground mb-1.5 sm:mb-2">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-[10px] sm:text-xs font-medium">Catégories</span>
            </div>
            {!mounted || loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{currentSummary.categoriesUsed}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {currentSummary.uncategorized} non catég.
                </p>
              </>
            )}
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="operations" className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="w-full overflow-x-auto -mx-1 px-1">
              <TabsList className="bg-muted/50 inline-flex w-max min-w-full sm:w-auto h-auto p-1 gap-1">
                <TabsTrigger value="operations" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                  Opérations
                </TabsTrigger>
                <TabsTrigger value="envelopes" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                  Enveloppes
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Analyses
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Paramètres
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button onClick={() => setOcrScannerOpen(true)} variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Scanner</span>
                <span className="sm:hidden">Scan</span>
              </Button>
              <AddExpenseDialog onSuccess={refetch} />
            </div>
          </div>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4">
            {/* Mobile filter */}
            <div className="block lg:hidden">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground whitespace-nowrap">Catégorie:</label>
                  <select
                    className="flex-1 p-2 text-sm border rounded-md bg-background"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">Toutes</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>
            </div>
            
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="hidden lg:block lg:col-span-1">
                <Card className="p-4">
                  <h3 className="font-medium mb-4">Filtres</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Catégorie</label>
                      <select
                        className="w-full mt-1 p-2 border rounded-md bg-background"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="all">Toutes les catégories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {getCategoryLabel(cat)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-3">
                <Card>
                  {loading ? (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des dépenses...</span>
                    </div>
                  ) : filteredExpenses.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-lg font-medium">Aucune dépense enregistrée</p>
                      <p className="text-sm mt-1">Commencez par ajouter votre première dépense</p>
                      <div className="mt-4">
                        <AddExpenseDialog onSuccess={refetch} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Mobile card view */}
                      <div className="block md:hidden divide-y">
                        {filteredExpenses.map((expense) => (
                          <div key={expense.id} className="p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{expense.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(expense.expense_date).toLocaleDateString("fr-FR")}
                                  {expense.horses?.name && ` • ${expense.horses.name}`}
                                </p>
                              </div>
                              <p className="font-semibold text-destructive text-sm whitespace-nowrap">
                                -{expense.amount.toFixed(0)}€
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge className={`${getCategoryColor(expense.category)} text-xs`}>
                                {getCategoryLabel(expense.category)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-destructive hover:text-destructive text-xs h-8 w-8 p-0"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Desktop table view */}
                      <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Titre</TableHead>
                            <TableHead className="text-xs">Catégorie</TableHead>
                            <TableHead className="text-xs">Cheval</TableHead>
                            <TableHead className="text-right text-xs">Montant</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell className="whitespace-nowrap text-sm">
                                {new Date(expense.expense_date).toLocaleDateString("fr-FR")}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{expense.title}</p>
                                  {expense.description && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {expense.description}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getCategoryColor(expense.category)}>
                                  {getCategoryLabel(expense.category)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {expense.horses?.name || <span className="text-muted-foreground">-</span>}
                              </TableCell>
                              <TableCell className="text-right font-medium text-destructive text-sm">
                                -{expense.amount.toFixed(2)}€
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  Supprimer
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    </>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Envelopes Tab */}
          <TabsContent value="envelopes">
            <BudgetEnvelopes />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsSection 
              expenses={expenses}
              currentSummary={currentSummary}
              previousSummary={previousSummary}
              percentageChange={percentageChange}
              getCategoryLabel={getCategoryLabel}
              getCategoryColor={getCategoryColor}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <IntegrationSettings />

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Catégories</h3>
              <p className="text-sm text-muted-foreground mb-4">Catégories de dépenses disponibles</p>
              <div className="flex flex-wrap gap-2">
                {["alimentation", "veterinaire", "marechalerie", "equipement", "pension", "transport", "competition", "assurance", "autre"].map((cat) => (
                  <Badge key={cat} className={getCategoryColor(cat)}>
                    {getCategoryLabel(cat)}
                  </Badge>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <OCRReceiptScanner open={ocrScannerOpen} onOpenChange={setOcrScannerOpen} />
    </AppLayout>
  )
}
