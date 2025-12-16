import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

interface BudgetSummaryProps {
  totalAmount: number
  previousMonthAmount?: number
  categories: Array<{
    name: string
    amount: number
    color: string
  }>
}

export function BudgetSummary({ totalAmount, previousMonthAmount, categories }: BudgetSummaryProps) {
  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount).slice(0, 4)
  const total = categories.reduce((sum, cat) => sum + cat.amount, 0)

  let percentChange = 0
  if (previousMonthAmount && previousMonthAmount > 0) {
    percentChange = ((totalAmount - previousMonthAmount) / previousMonthAmount) * 100
  }

  return (
    <Card className="p-5 bg-card border border-border">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total du mois</p>
            <p className="text-3xl font-semibold text-foreground">{totalAmount.toLocaleString("fr-FR")}€</p>
            {previousMonthAmount && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                {percentChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-destructive" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-secondary" />
                )}
                <span className={percentChange >= 0 ? "text-destructive" : "text-secondary"}>
                  {Math.abs(percentChange).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs mois dernier</span>
              </div>
            )}
          </div>
        </div>

        {/* Mini bar chart */}
        <div className="space-y-2">
          {sortedCategories.map((category) => {
            const percentage = total > 0 ? (category.amount / total) * 100 : 0
            return (
              <div key={category.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">{category.name}</span>
                  <span className="font-medium text-foreground">{category.amount.toLocaleString("fr-FR")}€</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <Link href="/budget" className="block">
          <Button variant="outline" className="w-full bg-transparent">
            Voir mon budget
          </Button>
        </Link>
      </div>
    </Card>
  )
}
