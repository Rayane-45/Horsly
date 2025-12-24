import { create } from "zustand"
import type { Account, Category, Operation, BudgetEnvelope, AutomationRule, Scenario, OperationFilters } from "./types"
import {
  mockAccounts,
  mockCategories,
  mockOperations,
  mockBudgetEnvelopes,
  mockAutomationRules,
  mockScenarios,
} from "./mock-data"

interface BudgetStore {
  // Data
  accounts: Account[]
  categories: Category[]
  operations: Operation[]
  envelopes: BudgetEnvelope[]
  rules: AutomationRule[]
  scenarios: Scenario[]

  // Filters
  filters: OperationFilters
  setFilters: (filters: Partial<OperationFilters>) => void
  resetFilters: () => void

  // Selected items
  selectedOperations: string[]
  setSelectedOperations: (ids: string[]) => void
  toggleOperationSelection: (id: string) => void
  clearSelection: () => void

  // CRUD Operations
  addOperation: (operation: Omit<Operation, "id" | "createdAt" | "updatedAt">) => void
  updateOperation: (id: string, updates: Partial<Operation>) => void
  deleteOperation: (id: string) => void
  bulkUpdateOperations: (ids: string[], updates: Partial<Operation>) => void

  // Accounts
  addAccount: (account: Omit<Account, "id" | "createdAt" | "updatedAt">) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void

  // Categories
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void

  // Envelopes
  addEnvelope: (envelope: Omit<BudgetEnvelope, "id" | "createdAt" | "updatedAt">) => void
  updateEnvelope: (id: string, updates: Partial<BudgetEnvelope>) => void
  deleteEnvelope: (id: string) => void

  // Rules
  addRule: (rule: Omit<AutomationRule, "id" | "createdAt" | "updatedAt">) => void
  updateRule: (id: string, updates: Partial<AutomationRule>) => void
  deleteRule: (id: string) => void
  reorderRules: (rules: AutomationRule[]) => void

  // Scenarios
  addScenario: (scenario: Omit<Scenario, "id" | "createdAt" | "updatedAt">) => void
  updateScenario: (id: string, updates: Partial<Scenario>) => void
  deleteScenario: (id: string) => void
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  // Initial data
  accounts: mockAccounts,
  categories: mockCategories,
  operations: mockOperations,
  envelopes: mockBudgetEnvelopes,
  rules: mockAutomationRules,
  scenarios: mockScenarios,

  // Filters
  filters: {},
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: {} }),

  // Selection
  selectedOperations: [],
  setSelectedOperations: (ids) => set({ selectedOperations: ids }),
  toggleOperationSelection: (id) =>
    set((state) => ({
      selectedOperations: state.selectedOperations.includes(id)
        ? state.selectedOperations.filter((opId) => opId !== id)
        : [...state.selectedOperations, id],
    })),
  clearSelection: () => set({ selectedOperations: [] }),

  // Operations CRUD
  addOperation: (operation) =>
    set((state) => ({
      operations: [
        ...state.operations,
        {
          ...operation,
          id: `op-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateOperation: (id, updates) =>
    set((state) => ({
      operations: state.operations.map((op) =>
        op.id === id ? { ...op, ...updates, updatedAt: new Date().toISOString() } : op,
      ),
    })),

  deleteOperation: (id) =>
    set((state) => ({
      operations: state.operations.filter((op) => op.id !== id),
    })),

  bulkUpdateOperations: (ids, updates) =>
    set((state) => ({
      operations: state.operations.map((op) =>
        ids.includes(op.id) ? { ...op, ...updates, updatedAt: new Date().toISOString() } : op,
      ),
    })),

  // Accounts CRUD
  addAccount: (account) =>
    set((state) => ({
      accounts: [
        ...state.accounts,
        {
          ...account,
          id: `acc-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateAccount: (id, updates) =>
    set((state) => ({
      accounts: state.accounts.map((acc) =>
        acc.id === id ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc,
      ),
    })),

  deleteAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc.id !== id),
    })),

  // Categories CRUD
  addCategory: (category) =>
    set((state) => ({
      categories: [
        ...state.categories,
        {
          ...category,
          id: `cat-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates, updatedAt: new Date().toISOString() } : cat,
      ),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    })),

  // Envelopes CRUD
  addEnvelope: (envelope) =>
    set((state) => ({
      envelopes: [
        ...state.envelopes,
        {
          ...envelope,
          id: `env-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateEnvelope: (id, updates) =>
    set((state) => ({
      envelopes: state.envelopes.map((env) =>
        env.id === id ? { ...env, ...updates, updatedAt: new Date().toISOString() } : env,
      ),
    })),

  deleteEnvelope: (id) =>
    set((state) => ({
      envelopes: state.envelopes.filter((env) => env.id !== id),
    })),

  // Rules CRUD
  addRule: (rule) =>
    set((state) => ({
      rules: [
        ...state.rules,
        {
          ...rule,
          id: `rule-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateRule: (id, updates) =>
    set((state) => ({
      rules: state.rules.map((rule) =>
        rule.id === id ? { ...rule, ...updates, updatedAt: new Date().toISOString() } : rule,
      ),
    })),

  deleteRule: (id) =>
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== id),
    })),

  reorderRules: (rules) => set({ rules }),

  // Scenarios CRUD
  addScenario: (scenario) =>
    set((state) => ({
      scenarios: [
        ...state.scenarios,
        {
          ...scenario,
          id: `scenario-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateScenario: (id, updates) =>
    set((state) => ({
      scenarios: state.scenarios.map((scenario) =>
        scenario.id === id ? { ...scenario, ...updates, updatedAt: new Date().toISOString() } : scenario,
      ),
    })),

  deleteScenario: (id) =>
    set((state) => ({
      scenarios: state.scenarios.filter((scenario) => scenario.id !== id),
    })),
}))
