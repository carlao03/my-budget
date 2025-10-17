import { getTransactions, getSpendingLimits, getCategories } from "./data-store"

export interface Alert {
  id: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  limitAmount: number
  currentAmount: number
  percentage: number
  period: "weekly" | "monthly"
  severity: "warning" | "danger"
}

export function getActiveAlerts(userId: string): Alert[] {
  const limits = getSpendingLimits(userId)
  const transactions = getTransactions(userId)
  const categories = getCategories(userId)
  const alerts: Alert[] = []

  const now = new Date()

  limits.forEach((limit) => {
    const category = categories.find((c) => c.id === limit.categoryId)
    if (!category) return

    // Calculate period start date
    let periodStart: Date
    if (limit.period === "monthly") {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      // Weekly - last 7 days
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - 7)
    }

    // Calculate spending in period for this category
    const periodSpending = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date)
        return (
          t.type === "expense" &&
          t.categoryId === limit.categoryId &&
          transactionDate >= periodStart &&
          transactionDate <= now
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const percentage = (periodSpending / limit.limitAmount) * 100

    // Only create alert if spending is >= 80% of limit
    if (percentage >= 80) {
      alerts.push({
        id: limit.id,
        categoryId: limit.categoryId,
        categoryName: category.name,
        categoryIcon: category.icon,
        limitAmount: limit.limitAmount,
        currentAmount: periodSpending,
        percentage,
        period: limit.period,
        severity: percentage >= 100 ? "danger" : "warning",
      })
    }
  })

  return alerts.sort((a, b) => b.percentage - a.percentage)
}
