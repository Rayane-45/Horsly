"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"

export interface Expense {
  id: string
  category: string
  title: string
  description?: string
  amount: number
  expense_date: string
  horse_id?: string
  payment_method?: string
  receipt_url?: string
  is_recurring?: boolean
  recurrence_period?: string
  notes?: string
  horses?: { name: string }
  created_at: string
  updated_at: string
}

export interface BudgetSummary {
  budget: number
  spent: number
  remaining: number
  byCategory: Record<string, number>
  categoryLimits: Record<string, number>
}

export function useExpenses(filters?: {
  startDate?: string
  endDate?: string
  category?: string
}) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchExpenses = async () => {
    if (!user) {
      setExpenses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.startDate) params.append("startDate", filters.startDate)
      if (filters?.endDate) params.append("endDate", filters.endDate)
      if (filters?.category) params.append("category", filters.category)

      const response = await fetch(`/api/budget/expenses?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des dépenses")
      }

      setExpenses(data.expenses || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [user, filters?.startDate, filters?.endDate, filters?.category])

  const addExpense = async (expenseData: Partial<Expense>) => {
    try {
      const response = await fetch("/api/budget/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la dépense")
      }

      await fetchExpenses()
      return data.expense
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/budget/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour de la dépense")
      }

      await fetchExpenses()
      return data.expense
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/budget/expenses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression de la dépense")
      }

      await fetchExpenses()
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}

export function useBudgetSummary(month?: number, year?: number) {
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSummary = async () => {
    if (!user) {
      setSummary(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (month) params.append("month", month.toString())
      if (year) params.append("year", year.toString())

      const response = await fetch(`/api/budget/summary?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement du budget")
      }

      setSummary(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [user, month, year])

  const updateBudget = async (budgetData: {
    month: number
    year: number
    planned_amount: number
    category_limits?: Record<string, number>
  }) => {
    try {
      const response = await fetch("/api/budget/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour du budget")
      }

      await fetchSummary()
      return data.budget
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  return {
    summary,
    loading,
    error,
    updateBudget,
    refetch: fetchSummary,
  }
}
