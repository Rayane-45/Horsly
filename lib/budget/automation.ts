import type { Operation, AutomationRule, RuleCondition } from "./types"

export function evaluateCondition(operation: Operation, condition: RuleCondition): boolean {
  const { field, op, value, min, max } = condition

  switch (field) {
    case "label":
      if (op === "CONTAINS" && value) {
        return operation.label.toLowerCase().includes(value.toLowerCase())
      }
      if (op === "EQUALS" && value) {
        return operation.label.toLowerCase() === value.toLowerCase()
      }
      break

    case "amount":
      if (op === "BETWEEN" && min !== undefined && max !== undefined) {
        return operation.amount >= min && operation.amount <= max
      }
      if (op === "GREATER_THAN" && value) {
        return operation.amount > Number(value)
      }
      if (op === "LESS_THAN" && value) {
        return operation.amount < Number(value)
      }
      if (op === "EQUALS" && value) {
        return operation.amount === Number(value)
      }
      break

    case "source":
      if (op === "EQUALS" && value) {
        return operation.source === value
      }
      break

    case "horseId":
      if (op === "EQUALS" && value) {
        return operation.horseId === value
      }
      break

    case "tag":
      if (op === "CONTAINS" && value) {
        return operation.tags.some((tag) => tag.toLowerCase().includes(value.toLowerCase()))
      }
      break

    case "payee":
      if (op === "CONTAINS" && value) {
        return operation.payee?.toLowerCase().includes(value.toLowerCase()) || false
      }
      if (op === "EQUALS" && value) {
        return operation.payee?.toLowerCase() === value.toLowerCase()
      }
      break
  }

  return false
}

export function evaluateRule(operation: Operation, rule: AutomationRule): boolean {
  if (!rule.enabled) return false

  // All conditions must match (AND logic)
  return rule.conditions.every((condition) => evaluateCondition(operation, condition))
}

export function applyRuleActions(operation: Operation, rule: AutomationRule): Partial<Operation> {
  const updates: Partial<Operation> = {}

  rule.actions.forEach((action) => {
    switch (action.type) {
      case "SET_CATEGORY":
        if (action.categoryId) {
          updates.categoryId = action.categoryId
        }
        break

      case "ADD_TAG":
        if (action.value && !operation.tags.includes(action.value)) {
          updates.tags = [...operation.tags, action.value]
        }
        break

      case "SET_RECONCILIATION":
        if (action.value) {
          updates.reconciliation = action.value as Operation["reconciliation"]
        }
        break

      case "SET_RIDER":
        if (action.riderId) {
          updates.riderId = action.riderId
        }
        break
    }
  })

  return updates
}

export function applyAutomationRules(operation: Operation, rules: AutomationRule[]): Partial<Operation> {
  // Sort rules by priority
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)

  let updates: Partial<Operation> = {}

  // Apply rules in priority order, stop at first match
  for (const rule of sortedRules) {
    if (evaluateRule(operation, rule)) {
      updates = { ...updates, ...applyRuleActions(operation, rule) }
      break // Court-circuit: stop at first matching rule
    }
  }

  return updates
}

export function testRuleOnOperations(
  rule: AutomationRule,
  operations: Operation[],
): {
  matches: Operation[]
  updates: Array<{ operation: Operation; updates: Partial<Operation> }>
} {
  const matches: Operation[] = []
  const updates: Array<{ operation: Operation; updates: Partial<Operation> }> = []

  operations.forEach((operation) => {
    if (evaluateRule(operation, rule)) {
      matches.push(operation)
      const ruleUpdates = applyRuleActions(operation, rule)
      if (Object.keys(ruleUpdates).length > 0) {
        updates.push({ operation, updates: ruleUpdates })
      }
    }
  })

  return { matches, updates }
}
