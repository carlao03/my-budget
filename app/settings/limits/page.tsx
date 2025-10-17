"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  getSpendingLimits,
  saveSpendingLimit,
  deleteSpendingLimit,
  getCategories,
  getTransactions,
} from "@/lib/data-store"
import type { SpendingLimit } from "@/lib/types"
import { Plus, Trash2, AlertTriangle, Bell } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import Link from "next/link"

export default function SpendingLimitsPage() {
  const { user } = useAuth()
  const [limits, setLimits] = useState<SpendingLimit[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state
  const [categoryId, setCategoryId] = useState("")
  const [limitAmount, setLimitAmount] = useState("")
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly")
  const [error, setError] = useState("")

  const categories = user ? getCategories(user.id) : []
  const transactions = user ? getTransactions(user.id) : []

  useEffect(() => {
    if (user) {
      loadLimits()
    }
  }, [user])

  const loadLimits = () => {
    if (user) {
      const allLimits = getSpendingLimits(user.id)
      setLimits(allLimits)
    }
  }

  const openCreateDialog = () => {
    setCategoryId("")
    setLimitAmount("")
    setPeriod("monthly")
    setError("")
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    setError("")

    if (!categoryId) {
      setError("Selecione uma categoria")
      return
    }

    const amountNum = Number.parseFloat(limitAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Valor do limite deve ser maior que zero")
      return
    }

    // Check for duplicate
    const duplicate = limits.find((l) => l.categoryId === categoryId && l.period === period)
    if (duplicate) {
      setError("Já existe um limite para esta categoria neste período")
      return
    }

    if (!user) return

    const limit: SpendingLimit = {
      id: Date.now().toString(),
      userId: user.id,
      categoryId,
      limitAmount: amountNum,
      period,
      createdAt: new Date().toISOString(),
    }

    saveSpendingLimit(user.id, limit)
    loadLimits()
    setIsDialogOpen(false)
  }

  const handleDelete = () => {
    if (user && deleteId) {
      deleteSpendingLimit(user.id, deleteId)
      loadLimits()
      setDeleteId(null)
    }
  }

  const getCurrentSpending = (limit: SpendingLimit) => {
    const now = new Date()
    let periodStart: Date

    if (limit.period === "monthly") {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      periodStart = new Date(now)
      periodStart.setDate(now.getDate() - 7)
    }

    return transactions
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
  }

  const availableCategories = categories.filter(
    (cat) => !limits.some((l) => l.categoryId === cat.id && l.period === period),
  )

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Limites de Gastos</h1>
              <p className="text-gray-500 mt-1">Defina limites para controlar seus gastos por categoria</p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Limite
            </Button>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Como funcionam os alertas?</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Você receberá alertas quando seus gastos atingirem 80% do limite definido. Quando ultrapassar 100%,
                    o alerta ficará vermelho indicando que o limite foi excedido.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limits List */}
          {limits.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum limite de gastos definido</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro limite
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {limits.map((limit) => {
                const category = categories.find((c) => c.id === limit.categoryId)
                const currentSpending = getCurrentSpending(limit)
                const percentage = (currentSpending / limit.limitAmount) * 100
                const isWarning = percentage >= 80 && percentage < 100
                const isDanger = percentage >= 100

                return (
                  <Card
                    key={limit.id}
                    className={`${
                      isDanger
                        ? "border-red-300 bg-red-50"
                        : isWarning
                          ? "border-orange-300 bg-orange-50"
                          : "border-gray-200"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${category?.color}20` }}
                          >
                            {category?.icon || "📦"}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category?.name || "Categoria"}</CardTitle>
                            <CardDescription>
                              Limite {limit.period === "monthly" ? "Mensal" : "Semanal"}
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(limit.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Alert Badge */}
                      {(isWarning || isDanger) && (
                        <div
                          className={`flex items-center gap-2 p-3 rounded-lg ${
                            isDanger ? "bg-red-100 text-red-900" : "bg-orange-100 text-orange-900"
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {isDanger ? "Limite ultrapassado!" : "Próximo do limite"}
                          </span>
                        </div>
                      )}

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Gasto atual</span>
                          <span className="font-semibold">{percentage.toFixed(0)}%</span>
                        </div>
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={`h-3 ${
                            isDanger
                              ? "[&>div]:bg-red-600"
                              : isWarning
                                ? "[&>div]:bg-orange-600"
                                : "[&>div]:bg-blue-600"
                          }`}
                        />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">R$ {currentSpending.toFixed(2)}</span>
                          <span className="font-semibold text-gray-900">R$ {limit.limitAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Remaining */}
                      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                        <span className="text-sm text-gray-600">
                          {currentSpending >= limit.limitAmount ? "Excedido em" : "Disponível"}
                        </span>
                        <span
                          className={`font-semibold ${
                            currentSpending >= limit.limitAmount ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          R$ {Math.abs(limit.limitAmount - currentSpending).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Back to Settings */}
          <div className="pt-4">
            <Link href="/settings">
              <Button variant="outline">Voltar para Configurações</Button>
            </Link>
          </div>
        </div>

        {/* Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Limite de Gastos</DialogTitle>
              <DialogDescription>Defina um limite de gastos para uma categoria específica</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Select value={period} onValueChange={(value: "weekly" | "monthly") => setPeriod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">Todas as categorias já possuem limites</div>
                    ) : (
                      availableCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limitAmount">Valor do Limite (R$)</Label>
                <Input
                  id="limitAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Criar Limite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este limite? Esta ação não pode ser desfeita.
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
