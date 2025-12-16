"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Filter, X, Search } from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"
import type { OperationType, OperationSource } from "@/lib/budget/types"

export function OperationsFilters() {
  const { filters, setFilters, resetFilters, accounts, categories } = useBudgetStore()
  const [isExpanded, setIsExpanded] = useState(false)

  const horses = [
    { id: "1", name: "Luna" },
    { id: "2", name: "Thunder" },
  ]

  const activeFiltersCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof typeof filters]
    return value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)
  }).length

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Filtres</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? "Réduire" : "Développer"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans les opérations..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-9 bg-background border-border text-foreground"
          />
        </div>
      </div>

      {isExpanded && (
        <>
          <Separator className="my-4" />

          <div className="space-y-4">
            {/* Period */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Période</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="periodStart" className="text-xs text-muted-foreground">
                    Du
                  </Label>
                  <Input
                    id="periodStart"
                    type="date"
                    value={filters.periodStart || ""}
                    onChange={(e) => setFilters({ periodStart: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="periodEnd" className="text-xs text-muted-foreground">
                    Au
                  </Label>
                  <Input
                    id="periodEnd"
                    type="date"
                    value={filters.periodEnd || ""}
                    onChange={(e) => setFilters({ periodEnd: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Type d'opération</Label>
              <div className="space-y-2">
                {(["EXPENSE", "INCOME", "REFUND", "TRANSFER"] as OperationType[]).map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.types?.includes(type)}
                      onCheckedChange={(checked) => {
                        const current = filters.types || []
                        setFilters({
                          types: checked ? [...current, type] : current.filter((t) => t !== type),
                        })
                      }}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm text-foreground cursor-pointer">
                      {type === "EXPENSE" && "Dépense"}
                      {type === "INCOME" && "Revenu"}
                      {type === "REFUND" && "Remboursement"}
                      {type === "TRANSFER" && "Virement"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Accounts */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Comptes</Label>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`account-${account.id}`}
                      checked={filters.accounts?.includes(account.id)}
                      onCheckedChange={(checked) => {
                        const current = filters.accounts || []
                        setFilters({
                          accounts: checked ? [...current, account.id] : current.filter((a) => a !== account.id),
                        })
                      }}
                    />
                    <Label htmlFor={`account-${account.id}`} className="text-sm text-foreground cursor-pointer">
                      {account.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Catégories</Label>
              <div className="space-y-2">
                {categories
                  .filter((c) => !c.parentId)
                  .map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.categories?.includes(category.id)}
                        onCheckedChange={(checked) => {
                          const current = filters.categories || []
                          setFilters({
                            categories: checked ? [...current, category.id] : current.filter((c) => c !== category.id),
                          })
                        }}
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-sm text-foreground cursor-pointer">
                        {category.label}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Horses */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Chevaux</Label>
              <div className="space-y-2">
                {horses.map((horse) => (
                  <div key={horse.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`horse-${horse.id}`}
                      checked={filters.horses?.includes(horse.id)}
                      onCheckedChange={(checked) => {
                        const current = filters.horses || []
                        setFilters({
                          horses: checked ? [...current, horse.id] : current.filter((h) => h !== horse.id),
                        })
                      }}
                    />
                    <Label htmlFor={`horse-${horse.id}`} className="text-sm text-foreground cursor-pointer">
                      {horse.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Source</Label>
              <div className="space-y-2">
                {(["MANUAL", "HEALTH", "TRAINING", "IMPORT"] as OperationSource[]).map((source) => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${source}`}
                      checked={filters.sources?.includes(source)}
                      onCheckedChange={(checked) => {
                        const current = filters.sources || []
                        setFilters({
                          sources: checked ? [...current, source] : current.filter((s) => s !== source),
                        })
                      }}
                    />
                    <Label htmlFor={`source-${source}`} className="text-sm text-foreground cursor-pointer">
                      {source === "MANUAL" && "Manuel"}
                      {source === "HEALTH" && "Santé"}
                      {source === "TRAINING" && "Entraînement"}
                      {source === "IMPORT" && "Import"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label className="text-foreground text-sm font-medium">Montant</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="amountMin" className="text-xs text-muted-foreground">
                    Min
                  </Label>
                  <Input
                    id="amountMin"
                    type="number"
                    step="0.01"
                    value={filters.amountMin || ""}
                    onChange={(e) => setFilters({ amountMin: Number(e.target.value) })}
                    placeholder="0.00"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="amountMax" className="text-xs text-muted-foreground">
                    Max
                  </Label>
                  <Input
                    id="amountMax"
                    type="number"
                    step="0.01"
                    value={filters.amountMax || ""}
                    onChange={(e) => setFilters({ amountMax: Number(e.target.value) })}
                    placeholder="0.00"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Other filters */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forecast"
                  checked={filters.forecast === true}
                  onCheckedChange={(checked) => setFilters({ forecast: checked ? true : undefined })}
                />
                <Label htmlFor="forecast" className="text-sm text-foreground cursor-pointer">
                  Opérations prévisionnelles uniquement
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAttachments"
                  checked={filters.hasAttachments === true}
                  onCheckedChange={(checked) => setFilters({ hasAttachments: checked ? true : undefined })}
                />
                <Label htmlFor="hasAttachments" className="text-sm text-foreground cursor-pointer">
                  Avec pièces jointes uniquement
                </Label>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
