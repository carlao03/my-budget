"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTransactions, getCategories, initializeCategories } from "@/lib/data-store"
import { AlertsBanner } from "@/components/alerts-banner"
import type { Transaction } from "@/lib/types"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BarChart3,
  Target,
} from "lucide-react"
import Link from "next/link"

export function DashboardContent({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [monthIncome, setMonthIncome] = useState(0)
  const [monthExpenses, setMonthExpenses] = useState(0)

  useEffect(() => {
    if (userId) {
      initializeCategories(userId)
      const allTransactions = getTransactions(userId)
      setTransactions(allTransactions)

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      let totalIncome = 0
      let totalExpenses = 0
      let monthlyIncome = 0
      let monthlyExpenses = 0

      allTransactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.date)
        const isCurrentMonth =
          transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear

        if (transaction.type === "income") {
          totalIncome += transaction.amount
          if (isCurrentMonth) monthlyIncome += transaction.amount
        } else {
          totalExpenses += transaction.amount
          if (isCurrentMonth) monthlyExpenses += transaction.amount
        }
      })

      setBalance(totalIncome - totalExpenses)
      setMonthIncome(monthlyIncome)
      setMonthExpenses(monthlyExpenses)
    }
  }, [userId])

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const categories = getCategories(userId)

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      <AlertsBanner userId={userId} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral das suas finanças</p>
        </div>
        <Link href="/transactions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">R$ {balance.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Total de receitas menos despesas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {monthIncome.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Total recebido este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {monthExpenses.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Total gasto este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma transação registrada ainda</p>
              <Link href="/transactions/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeira transação
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const category = categories.find((c) => c.id === transaction.categoryId)
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${
                          transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {category?.icon || "📦"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {category?.name || "Sem categoria"} • {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/transactions/new?type=income">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Adicionar Receita</p>
                  <p className="text-sm text-gray-500">Registrar entrada</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/transactions/new?type=expense">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Adicionar Despesa</p>
                  <p className="text-sm text-gray-500">Registrar saída</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ver Relatórios</p>
                  <p className="text-sm text-gray-500">Análise detalhada</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/goals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Minhas Metas</p>
                  <p className="text-sm text-gray-500">Acompanhar progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
