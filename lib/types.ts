export type TransactionType = "income" | "expense"

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  isDefault: boolean
}

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  description: string
  amount: number
  date: string
  categoryId: string
  paymentMethod?: string
  isRecurring: boolean
  recurrenceFrequency?: "weekly" | "monthly"
  createdAt: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  startDate: string
  endDate: string
  categoryId?: string
  status: "active" | "completed" | "cancelled"
  createdAt: string
}

export interface SpendingLimit {
  id: string
  userId: string
  categoryId: string
  limitAmount: number
  period: "weekly" | "monthly"
  createdAt: string
}
