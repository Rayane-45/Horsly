"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
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

interface ExpensesContextType {
  expenses: Expense[]
  loading: boolean
  error: string | null
  addExpense: (expenseData: Partial<Expense>) => Promise<Expense>
  updateExpense: (id: string, expenseData: Partial<Expense>) => Promise<Expense>
  deleteExpense: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const ExpensesContext = createContext<ExpensesContextType | null>(null)

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch("/api/budget/expenses")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des dépenses")
      }

      setExpenses(data.expenses || [])
      setError(null)
    } catch (err: any) {
      console.error("[ExpensesContext] Error fetching expenses:", err)
      setError(err.message)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = useCallback(async (expenseData: Partial<Expense>): Promise<Expense> => {
    const response = await fetch("/api/budget/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de la création de la dépense")
    }
    
    // Refetch all expenses to ensure consistency
    await fetchExpenses()
    
    return data.expense
  }, [fetchExpenses])

  const updateExpense = useCallback(async (id: string, expenseData: Partial<Expense>): Promise<Expense> => {
    
    const response = await fetch(`/api/budget/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de la mise à jour de la dépense")
    }
    
    // Refetch all expenses to ensure consistency
    await fetchExpenses()
    
    return data.expense
  }, [fetchExpenses])

  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/budget/expenses/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Erreur lors de la suppression de la dépense")
    }
    
    // Refetch all expenses to ensure consistency
    await fetchExpenses()
  }, [fetchExpenses])

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        loading,
        error,
        addExpense,
        updateExpense,
        deleteExpense,
        refetch: fetchExpenses,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  )
}

export function useExpensesContext() {
  const context = useContext(ExpensesContext)
  if (!context) {
    throw new Error("useExpensesContext must be used within an ExpensesProvider")
  }
  return context
}
