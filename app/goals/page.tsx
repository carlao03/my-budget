"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getGoals, deleteGoal, saveGoal, getCategories } from "@/lib/data-store"
import type { Goal } from "@/lib/types"
import { Plus, Target, Pencil, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react"
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

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const categories = user ? getCategories(user.id) : []

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = () => {
    if (user) {
      const allGoals = getGoals(user.id)
      setGoals(allGoals)
    }
  }

  const handleDelete = () => {
    if (user && deleteId) {
      deleteGoal(user.id, deleteId)
      loadGoals()
      setDeleteId(null)
    }
  }

  const handleToggleStatus = (goal: Goal) => {
    if (!user) return

    const newStatus = goal.status === "completed" ? "active" : "completed"
    const updatedGoal: Goal = {
      ...goal,
      status: newStatus,
      currentAmount: newStatus === "completed" ? goal.targetAmount : goal.currentAmount,
    }

    saveGoal(user.id, updatedGoal)
    loadGoals()
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const cancelledGoals = goals.filter((g) => g.status === "cancelled")

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusIcon = (status: Goal["status"]) => {
    switch (status) {
      case "active":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusLabel = (status: Goal["status"]) => {
    switch (status) {
      case "active":
        return "Em andamento"
      case "completed":
        return "Concluída"
      case "cancelled":
        return "Cancelada"
    }
  }

  const renderGoalCard = (goal: Goal) => {
    const progress = getProgressPercentage(goal)
    const daysRemaining = getDaysRemaining(goal.endDate)
    const category = categories.find((c) => c.id === goal.categoryId)

    return (
      <Card key={goal.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(goal.status)}
                <span className="text-sm font-medium text-gray-600">{getStatusLabel(goal.status)}</span>
              </div>
              <CardTitle className="text-xl">{goal.title}</CardTitle>
              {goal.description && <CardDescription className="mt-2">{goal.description}</CardDescription>}
            </div>
            <div className="flex items-center gap-1">
              <Link href={`/goals/edit/${goal.id}`}>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(goal.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progresso</span>
              <span className="font-semibold text-gray-900">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">R$ {goal.currentAmount.toFixed(2)}</span>
              <span className="font-semibold text-gray-900">R$ {goal.targetAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount Remaining */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-gray-600">Falta alcançar</span>
            <span className="font-semibold text-blue-600">
              R$ {(goal.targetAmount - goal.currentAmount).toFixed(2)}
            </span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs text-gray-500">Data de início</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(goal.startDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Data de término</p>
              <p className="text-sm font-medium text-gray-900">{new Date(goal.endDate).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          {goal.status === "active" && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Prazo expirado"}
              </span>
              {category && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {goal.status === "active" && progress >= 100 && (
            <Button onClick={() => handleToggleStatus(goal)} className="w-full" variant="default">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marcar como concluída
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
              <p className="text-gray-500 mt-1">Defina e acompanhe seus objetivos financeiros</p>
            </div>
            <Link href="/goals/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Metas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{activeGoals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedGoals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Canceladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400">{cancelledGoals.length}</div>
              </CardContent>
            </Card>
          </div>

          {goals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma meta financeira criada ainda</p>
                <Link href="/goals/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira meta
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Active Goals */}
              {activeGoals.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Metas em Andamento</h2>
                  <div className="grid gap-6 md:grid-cols-2">{activeGoals.map(renderGoalCard)}</div>
                </div>
              )}

              {/* Completed Goals */}
              {completedGoals.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Metas Concluídas</h2>
                  <div className="grid gap-6 md:grid-cols-2">{completedGoals.map(renderGoalCard)}</div>
                </div>
              )}

              {/* Cancelled Goals */}
              {cancelledGoals.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Metas Canceladas</h2>
                  <div className="grid gap-6 md:grid-cols-2">{cancelledGoals.map(renderGoalCard)}</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
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
