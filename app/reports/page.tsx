"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTransactions, getCategories } from "@/lib/data-store"
import type { Transaction } from "@/lib/types"
import { BarChart3, PieChartIcon, TrendingUp, Calendar } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"

type PeriodType = "current-month" | "last-3-months" | "current-year" | "all-time"

export default function ReportsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [period, setPeriod] = useState<PeriodType>("current-month")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  const categories = user ? getCategories(user.id) : []

  useEffect(() => {
    if (user) {
      const allTransactions = getTransactions(user.id)
      setTransactions(allTransactions)
    }
  }, [user])

  useEffect(() => {
    filterByPeriod()
  }, [transactions, period])

  const filterByPeriod = () => {
    const now = new Date()
    let filtered = [...transactions]

    switch (period) {
      case "current-month":
        filtered = filtered.filter((t) => {
          const date = new Date(t.date)
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        })
        break
      case "last-3-months":
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        filtered = filtered.filter((t) => new Date(t.date) >= threeMonthsAgo)
        break
      case "current-year":
        filtered = filtered.filter((t) => new Date(t.date).getFullYear() === now.getFullYear())
        break
      case "all-time":
        // No filter
        break
    }

    setFilteredTransactions(filtered)
  }

  // Calculate totals
  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  // Category distribution data for pie chart
  const categoryData = categories
    .map((category) => {
      const categoryTransactions = filteredTransactions.filter(
        (t) => t.categoryId === category.id && t.type === "expense",
      )
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
      return {
        name: category.name,
        value: total,
        color: category.color,
      }
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)

  // Monthly comparison data for bar chart
  const monthlyData = (() => {
    const months: { [key: string]: { income: number; expense: number } } = {}

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0 }
      }

      if (t.type === "income") {
        months[monthKey].income += t.amount
      } else {
        months[monthKey].expense += t.amount
      }
    })

    return Object.entries(months)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        Receitas: data.income,
        Despesas: data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
  })()

  // Balance evolution data for line chart
  const balanceEvolutionData = (() => {
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    let runningBalance = 0
    const balanceByDate: { [key: string]: number } = {}

    sortedTransactions.forEach((t) => {
      const dateKey = t.date
      if (t.type === "income") {
        runningBalance += t.amount
      } else {
        runningBalance -= t.amount
      }
      balanceByDate[dateKey] = runningBalance
    })

    return Object.entries(balanceByDate)
      .map(([date, balance]) => ({
        date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        Saldo: balance,
      }))
      .slice(-30) // Last 30 data points
  })()

  const getPeriodLabel = () => {
    switch (period) {
      case "current-month":
        return "Mês Atual"
      case "last-3-months":
        return "Últimos 3 Meses"
      case "current-year":
        return "Ano Atual"
      case "all-time":
        return "Todo o Período"
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
              <p className="text-gray-500 mt-1">Análise detalhada das suas finanças</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mês Atual</SelectItem>
                  <SelectItem value="last-3-months">Últimos 3 Meses</SelectItem>
                  <SelectItem value="current-year">Ano Atual</SelectItem>
                  <SelectItem value="all-time">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Saldo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  R$ {balance.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">{getPeriodLabel()}</p>
              </CardContent>
            </Card>
          </div>

          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Nenhuma transação encontrada para este período</p>
                <p className="text-sm text-gray-400">Selecione outro período ou adicione transações</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Charts Row 1 */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Category Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Distribuição por Categoria
                    </CardTitle>
                    <CardDescription>Despesas divididas por categoria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryData.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">Nenhuma despesa registrada</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Comparison Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Receitas vs Despesas
                    </CardTitle>
                    <CardDescription>Comparação mensal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {monthlyData.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">Nenhum dado disponível</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                          <Legend />
                          <Bar dataKey="Receitas" fill="#10b981" />
                          <Bar dataKey="Despesas" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Balance Evolution Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Evolução do Saldo
                  </CardTitle>
                  <CardDescription>Acompanhamento do saldo ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  {balanceEvolutionData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Nenhum dado disponível</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={balanceEvolutionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="Saldo" stroke="#2563eb" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Maiores Gastos por Categoria</CardTitle>
                  <CardDescription>Top 5 categorias com mais despesas</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Nenhuma despesa registrada</div>
                  ) : (
                    <div className="space-y-4">
                      {categoryData.slice(0, 5).map((category, index) => {
                        const percentage = (category.value / totalExpenses) * 100
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                                <span className="font-medium text-gray-900">{category.name}</span>
                              </div>
                              <span className="font-semibold text-gray-900">R$ {category.value.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%`, backgroundColor: category.color }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">{percentage.toFixed(1)}% do total de despesas</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
