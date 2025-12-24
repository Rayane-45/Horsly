"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHorses } from "@/hooks/use-horses"
import { Expense } from "@/contexts/expenses-context"
import { TrendingUp, TrendingDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface AnalyticsSectionProps {
  expenses: Expense[]
  currentSummary: {
    totalExpenses: number
    byCategory: Record<string, number>
  }
  previousSummary: {
    totalExpenses: number
  }
  percentageChange: number
  getCategoryLabel: (category: string) => string
  getCategoryColor: (category: string) => string
}

type AnalysisMode = "horses" | "monthly" | "yearly"

export function AnalyticsSection({
  expenses,
  currentSummary,
  previousSummary,
  percentageChange,
  getCategoryLabel,
  getCategoryColor,
}: AnalyticsSectionProps) {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("monthly")
  const { horses } = useHorses()

  // Analyse par cheval
  const horseComparison = useMemo(() => {
    const horseMap: Record<string, { name: string; total: number; byCategory: Record<string, number> }> = {}
    let unassignedTotal = 0
    const unassignedByCategory: Record<string, number> = {}
    
    expenses.forEach((expense) => {
      if (!expense.horse_id) {
        // Comptabiliser les dépenses non attribuées
        unassignedTotal += expense.amount
        unassignedByCategory[expense.category] = 
          (unassignedByCategory[expense.category] || 0) + expense.amount
        return
      }
      
      const horseId = expense.horse_id
      if (!horseMap[horseId]) {
        // Essayer de récupérer le nom du cheval depuis la relation ou depuis la liste des chevaux
        const horseName = expense.horses?.name || horses.find((h) => h.id === horseId)?.name || "Cheval inconnu"
        horseMap[horseId] = {
          name: horseName,
          total: 0,
          byCategory: {},
        }
      }
      horseMap[horseId].total += expense.amount
      horseMap[horseId].byCategory[expense.category] = 
        (horseMap[horseId].byCategory[expense.category] || 0) + expense.amount
    })

    // Ajouter les dépenses non attribuées si elles existent
    const result = Object.entries(horseMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total)
    
    if (unassignedTotal > 0) {
      result.push({
        id: "unassigned",
        name: "Non attribué",
        total: unassignedTotal,
        byCategory: unassignedByCategory
      })
    }

    return result
  }, [expenses, horses])

  // Analyse mensuelle (12 derniers mois)
  const monthlyComparison = useMemo(() => {
    const now = new Date()
    const months: Array<{ label: string; total: number; date: Date }> = []

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthExpenses = expenses.filter((e) => {
        const expDate = new Date(e.expense_date)
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear()
      })

      months.push({
        label: date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
        total: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
        date,
      })
    }

    return months
  }, [expenses])

  // Analyse annuelle
  const yearlyComparison = useMemo(() => {
    const yearMap: Record<string, number> = {}

    expenses.forEach((expense) => {
      const year = new Date(expense.expense_date).getFullYear().toString()
      yearMap[year] = (yearMap[year] || 0) + expense.amount
    })

    return Object.entries(yearMap)
      .map(([year, total]) => ({ year, total }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
  }, [expenses])

  const maxMonthlyAmount = Math.max(...monthlyComparison.map((m) => m.total), 1)

  return (
    <div className="space-y-6">
      {/* Sélection du mode d'analyse - Responsive */}
      <Card className="p-3 sm:p-4 bg-card border-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Label htmlFor="analysis-mode" className="text-foreground font-medium text-sm sm:text-base">
            Mode d'analyse
          </Label>
          <Select value={analysisMode} onValueChange={(value) => setAnalysisMode(value as AnalysisMode)}>
            <SelectTrigger id="analysis-mode" className="bg-card border-border text-foreground w-full sm:w-auto sm:min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="horses">Comparer les chevaux</SelectItem>
              <SelectItem value="monthly">Comparer les mois</SelectItem>
              <SelectItem value="yearly">Comparer les années</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Affichage selon le mode */}
      {analysisMode === "horses" && (
        <Card className="p-3 sm:p-6 bg-card border-border overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Comparer les chevaux</h3>
          {horseComparison.length === 0 ? (
            <div className="h-60 sm:h-80 flex items-center justify-center text-muted-foreground text-sm">
              Aucune dépense liée à un cheval
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Légende avec catégories principales - Affiché en premier */}
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                {horseComparison.slice(0, 4).map((horse) => (
                  <div key={horse.id} className="p-2 sm:p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="font-medium text-foreground text-xs sm:text-sm truncate mr-2">{horse.name}</span>
                      <span className="font-bold text-destructive text-xs sm:text-sm whitespace-nowrap">{horse.total.toFixed(0)}€</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(horse.byCategory)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 2)
                        .map(([cat, amount]) => (
                          <Badge key={cat} className={`${getCategoryColor(cat)} text-xs px-1.5 py-0.5`} variant="secondary">
                            {getCategoryLabel(cat)}: {amount.toFixed(0)}€
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bar Chart - Affiché en dernier */}
              <div className="-mx-3 sm:mx-0">
                <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                  <BarChart 
                    data={horseComparison}
                    margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                      width={40}
                    />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                            <p className="font-semibold text-foreground mb-2">{data.name}</p>
                            <p className="text-destructive font-bold">{data.total.toFixed(0)}€</p>
                            <div className="mt-2 space-y-1">
                              {Object.entries(data.byCategory)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .slice(0, 3)
                                .map(([cat, amount]) => (
                                  <p key={cat} className="text-xs text-muted-foreground">
                                    {getCategoryLabel(cat)}: {(amount as number).toFixed(0)}€
                                  </p>
                                ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  >
                    {horseComparison.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${(index * 360 / horseComparison.length)}, 70%, 50%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      )}

      {analysisMode === "monthly" && (
        <Card className="p-3 sm:p-6 bg-card border-border overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Comparer les mois</h3>
          {monthlyComparison.length === 0 ? (
            <div className="h-60 sm:h-80 flex items-center justify-center text-muted-foreground text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Statistiques du mois actuel - Affiché en premier */}
              <div className="grid gap-2 sm:gap-4 grid-cols-3">
                <div className="p-2 sm:p-4 border border-border rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Mois actuel</p>
                  <p className="text-sm sm:text-2xl font-bold text-foreground">
                    {currentSummary.totalExpenses.toFixed(0)}€
                  </p>
                </div>
                <div className="p-2 sm:p-4 border border-border rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Précédent</p>
                  <p className="text-sm sm:text-2xl font-bold text-foreground">
                    {previousSummary.totalExpenses.toFixed(0)}€
                  </p>
                </div>
                <div className="p-2 sm:p-4 border border-border rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Évolution</p>
                  <p className={`text-sm sm:text-2xl font-bold flex items-center gap-1 sm:gap-2 ${
                    percentageChange > 0 ? "text-destructive" : "text-green-500"
                  }`}>
                    {percentageChange > 0 ? (
                      <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 sm:h-5 sm:w-5" />
                    )}
                    <span className="text-xs sm:text-2xl">{percentageChange >= 0 ? "+" : ""}{percentageChange.toFixed(1)}%</span>
                  </p>
                </div>
              </div>

              {/* Bar Chart - Affiché en dernier */}
              <div className="-mx-3 sm:mx-0">
                <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                  <BarChart 
                    data={monthlyComparison}
                    margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="label" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 9 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                      width={35}
                    />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const index = monthlyComparison.findIndex(m => m.label === data.label)
                        const prevMonth = index > 0 ? monthlyComparison[index - 1] : null
                        const monthChange = prevMonth
                          ? ((data.total - prevMonth.total) / prevMonth.total) * 100
                          : 0
                        
                        return (
                          <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                            <p className="font-semibold text-foreground mb-1">{data.label}</p>
                            <p className="text-destructive font-bold mb-2">{data.total.toFixed(0)}€</p>
                            {prevMonth && monthChange !== 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                {monthChange > 0 ? (
                                  <TrendingUp className="h-3 w-3 text-destructive" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-green-500" />
                                )}
                                <span className={monthChange > 0 ? "text-destructive" : "text-green-500"}>
                                  {monthChange > 0 ? "+" : ""}{monthChange.toFixed(1)}% vs mois précédent
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  >
                    {monthlyComparison.map((entry, index) => {
                      const prevMonth = index > 0 ? monthlyComparison[index - 1] : null
                      const isIncreasing = prevMonth ? entry.total > prevMonth.total : false
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isIncreasing ? "hsl(var(--destructive))" : "hsl(142, 70%, 50%)"}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      )}

      {analysisMode === "yearly" && (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="p-3 sm:p-6 bg-card border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Dépenses par année</h3>
            {yearlyComparison.length === 0 ? (
              <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {yearlyComparison.map((yearData, index) => {
                  const prevYear = yearlyComparison[index + 1]
                  const yearChange = prevYear
                    ? ((yearData.total - prevYear.total) / prevYear.total) * 100
                    : 0

                  return (
                    <div key={yearData.year} className="p-3 sm:p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-base sm:text-lg font-semibold text-foreground">{yearData.year}</span>
                        {prevYear && yearChange !== 0 && (
                          <Badge
                            variant={yearChange > 0 ? "destructive" : "secondary"}
                            className="flex items-center gap-1 text-xs"
                          >
                            {yearChange > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {yearChange > 0 ? "+" : ""}
                            {yearChange.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-destructive">{yearData.total.toFixed(0)}€</p>
                      {prevYear && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {yearData.total > prevYear.total ? "+" : ""}
                          {(yearData.total - prevYear.total).toFixed(0)}€ vs {prevYear.year}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card className="p-3 sm:p-6 bg-card border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Répartition par catégorie</h3>
            {Object.keys(currentSummary.byCategory).length === 0 ? (
              <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {Object.entries(currentSummary.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getCategoryColor(category)} text-xs`}>
                          {getCategoryLabel(category)}
                        </Badge>
                      </div>
                      <span className="font-medium text-sm sm:text-base">{amount.toFixed(0)}€</span>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
