"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  Activity,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useBudgetStore } from "@/lib/budget/store"
import { applyOperationFilters, sortOperations } from "@/lib/budget/filters"
import { OperationFormDialog } from "./operation-form-dialog"
import type { Operation } from "@/lib/budget/types"

export function OperationsTable() {
  const {
    operations,
    filters,
    categories,
    selectedOperations,
    toggleOperationSelection,
    setSelectedOperations,
    clearSelection,
    deleteOperation,
    bulkUpdateOperations,
  } = useBudgetStore()

  const [sortBy, setSortBy] = useState<"date" | "amount" | "category" | "horse">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const horses = [
    { id: "1", name: "Luna" },
    { id: "2", name: "Thunder" },
  ]

  const filteredOperations = applyOperationFilters(operations, filters)
  const sortedOperations = sortOperations(filteredOperations, sortBy, sortOrder)

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const allSelected = sortedOperations.length > 0 && sortedOperations.every((op) => selectedOperations.includes(op.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      clearSelection()
    } else {
      setSelectedOperations(sortedOperations.map((op) => op.id))
    }
  }

  const getCategoryLabel = (categoryId?: string) => {
    if (!categoryId) return "Non catégorisé"
    const category = categories.find((c) => c.id === categoryId)
    return category?.label || "Inconnu"
  }

  const getHorseName = (horseId?: string) => {
    if (!horseId) return "Tous"
    const horse = horses.find((h) => h.id === horseId)
    return horse?.name || "Inconnu"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getSourceIcon = (source: Operation["source"]) => {
    switch (source) {
      case "HEALTH":
        return <Heart className="h-3 w-3" />
      case "TRAINING":
        return <Activity className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusBadge = (operation: Operation) => {
    if (operation.status === "FULLY_REFUNDED") {
      return (
        <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Remboursé
        </Badge>
      )
    }
    if (operation.status === "PARTIALLY_REFUNDED") {
      return (
        <Badge variant="outline" className="border-primary/20 text-primary">
          <AlertCircle className="h-3 w-3 mr-1" />
          Remb. partiel
        </Badge>
      )
    }
    if (operation.reconciliation === "EXCLUDED") {
      return (
        <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground">
          <XCircle className="h-3 w-3 mr-1" />
          Exclu
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedOperations.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {selectedOperations.length} opération{selectedOperations.length > 1 ? "s" : ""} sélectionnée
              {selectedOperations.length > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Bulk categorize
                }}
                className="border-border"
              >
                Catégoriser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  bulkUpdateOperations(selectedOperations, { reconciliation: "EXCLUDED" })
                  clearSelection()
                }}
                className="border-border"
              >
                Exclure
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedOperations.forEach((id) => deleteOperation(id))
                  clearSelection()
                }}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table Header */}
      <Card className="overflow-hidden border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-3 text-left">
                  <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                </th>
                <th className="p-3 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("date")}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Date
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Libellé</th>
                <th className="p-3 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("category")}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Catégorie
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </th>
                <th className="p-3 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("horse")}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cheval
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </th>
                <th className="p-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort("amount")}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Montant
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Statut</th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOperations.map((operation) => (
                <tr key={operation.id} className="border-b border-border hover:bg-accent/5 transition-colors">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedOperations.includes(operation.id)}
                      onCheckedChange={() => toggleOperationSelection(operation.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDate(operation.operationDate)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{operation.label}</p>
                        {operation.source !== "MANUAL" && (
                          <Badge variant="outline" className="border-primary/20 text-primary">
                            {getSourceIcon(operation.source)}
                            <span className="ml-1 text-xs">
                              {operation.source === "HEALTH" ? "Santé" : "Entraînement"}
                            </span>
                          </Badge>
                        )}
                        {operation.attachments.length > 0 && <FileText className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      {operation.note && <p className="text-xs text-muted-foreground">{operation.note}</p>}
                      {operation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {operation.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-border">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="border-border">
                      {getCategoryLabel(operation.categoryId)}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-foreground">{getHorseName(operation.horseId)}</td>
                  <td className="p-3 text-right">
                    <p
                      className={`text-sm font-semibold ${
                        operation.type === "EXPENSE"
                          ? "text-destructive"
                          : operation.type === "INCOME" || operation.type === "REFUND"
                            ? "text-secondary"
                            : "text-foreground"
                      }`}
                    >
                      {operation.type === "EXPENSE" ? "-" : "+"}
                      {operation.amount.toFixed(2)}€
                    </p>
                  </td>
                  <td className="p-3 text-center">{getStatusBadge(operation)}</td>
                  <td className="p-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <OperationFormDialog
                          operation={operation}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteOperation(operation.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedOperations.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Aucune opération trouvée</p>
          </div>
        )}
      </Card>
    </div>
  )
}
