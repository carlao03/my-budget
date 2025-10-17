"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTransactions, getCategories, deleteTransaction } from "@/lib/data-store"
import type { Transaction } from "@/lib/types"
import { Plus, Search, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const categories = user ? getCategories(user.id) : []

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, filterType, filterCategory])

  const loadTransactions = () => {
    if (user) {
      const allTransactions = getTransactions(user.id)
      setTransactions(allTransactions)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.categoryId === filterCategory)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)
  }

  const handleDelete = () => {
    if (user && deleteId) {
      deleteTransaction(user.id, deleteId)
      loadTransactions()
      setDeleteId(null)
    }
  }

  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
              <p className="text-gray-500 mt-1">Gerencie todas as suas receitas e despesas</p>
            </div>
            <Link href="/transactions/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Nenhuma transação encontrada</p>
                  <Link href="/transactions/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar transação
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => {
                    const category = categories.find((c) => c.id === transaction.categoryId)
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                              transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {category?.icon || "📦"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <span>{category?.name || "Sem categoria"}</span>
                              <span>•</span>
                              <span>{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                              {transaction.paymentMethod && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.paymentMethod}</span>
                                </>
                              )}
                              {transaction.isRecurring && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">Recorrente</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {transaction.type === "income" ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            )}
                            <span
                              className={`font-semibold text-lg ${
                                transaction.type === "income" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/transactions/edit/${transaction.id}`}>
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(transaction.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
