import type { Category, Transaction, Goal, SpendingLimit } from "./types"

// Default categories
export const defaultCategories: Category[] = [
  { id: "1", name: "Alimentação", color: "#ef4444", icon: "🍔", isDefault: true },
  { id: "2", name: "Transporte", color: "#3b82f6", icon: "🚗", isDefault: true },
  { id: "3", name: "Lazer", color: "#8b5cf6", icon: "🎮", isDefault: true },
  { id: "4", name: "Saúde", color: "#10b981", icon: "🏥", isDefault: true },
  { id: "5", name: "Educação", color: "#f59e0b", icon: "📚", isDefault: true },
  { id: "6", name: "Moradia", color: "#6366f1", icon: "🏠", isDefault: true },
  { id: "7", name: "Salário", color: "#10b981", icon: "💰", isDefault: true },
  { id: "8", name: "Outros", color: "#6b7280", icon: "📦", isDefault: true },
]

// Initialize default categories if not exists
export function initializeCategories(userId: string) {
  const key = `finance-categories-${userId}`
  const existing = localStorage.getItem(key)
  if (!existing) {
    localStorage.setItem(key, JSON.stringify(defaultCategories))
  }
}

// Categories
export function getCategories(userId: string): Category[] {
  const key = `finance-categories-${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : defaultCategories
}

export function saveCategory(userId: string, category: Category) {
  const categories = getCategories(userId)
  const index = categories.findIndex((c) => c.id === category.id)
  if (index >= 0) {
    categories[index] = category
  } else {
    categories.push(category)
  }
  localStorage.setItem(`finance-categories-${userId}`, JSON.stringify(categories))
}

export function deleteCategory(userId: string, categoryId: string) {
  const categories = getCategories(userId).filter((c) => c.id !== categoryId)
  localStorage.setItem(`finance-categories-${userId}`, JSON.stringify(categories))
}

// Transactions
export function getTransactions(userId: string): Transaction[] {
  const key = `finance-transactions-${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export function saveTransaction(userId: string, transaction: Transaction) {
  const transactions = getTransactions(userId)
  const index = transactions.findIndex((t) => t.id === transaction.id)
  if (index >= 0) {
    transactions[index] = transaction
  } else {
    transactions.push(transaction)
  }
  localStorage.setItem(`finance-transactions-${userId}`, JSON.stringify(transactions))
}

export function deleteTransaction(userId: string, transactionId: string) {
  const transactions = getTransactions(userId).filter((t) => t.id !== transactionId)
  localStorage.setItem(`finance-transactions-${userId}`, JSON.stringify(transactions))
}

// Goals
export function getGoals(userId: string): Goal[] {
  const key = `finance-goals-${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export function saveGoal(userId: string, goal: Goal) {
  const goals = getGoals(userId)
  const index = goals.findIndex((g) => g.id === goal.id)
  if (index >= 0) {
    goals[index] = goal
  } else {
    goals.push(goal)
  }
  localStorage.setItem(`finance-goals-${userId}`, JSON.stringify(goals))
}

export function deleteGoal(userId: string, goalId: string) {
  const goals = getGoals(userId).filter((g) => g.id !== goalId)
  localStorage.setItem(`finance-goals-${userId}`, JSON.stringify(goals))
}

// Spending Limits
export function getSpendingLimits(userId: string): SpendingLimit[] {
  const key = `finance-limits-${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export function saveSpendingLimit(userId: string, limit: SpendingLimit) {
  const limits = getSpendingLimits(userId)
  const index = limits.findIndex((l) => l.id === limit.id)
  if (index >= 0) {
    limits[index] = limit
  } else {
    limits.push(limit)
  }
  localStorage.setItem(`finance-limits-${userId}`, JSON.stringify(limits))
}

export function deleteSpendingLimit(userId: string, limitId: string) {
  const limits = getSpendingLimits(userId).filter((l) => l.id !== limitId)
  localStorage.setItem(`finance-limits-${userId}`, JSON.stringify(limits))
}
