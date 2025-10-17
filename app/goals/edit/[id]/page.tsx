"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveGoal, getGoals, getCategories } from "@/lib/data-store"
import type { Goal } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditGoalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [status, setStatus] = useState<Goal["status"]>("active")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const categories = user ? getCategories(user.id) : []

  useEffect(() => {
    if (user && goalId) {
      const goals = getGoals(user.id)
      const goal = goals.find((g) => g.id === goalId)

      if (goal) {
        setTitle(goal.title)
        setDescription(goal.description)
        setTargetAmount(goal.targetAmount.toString())
        setCurrentAmount(goal.currentAmount.toString())
        setStartDate(goal.startDate)
        setEndDate(goal.endDate)
        setCategoryId(goal.categoryId || "none")
        setStatus(goal.status)
      } else {
        setNotFound(true)
      }
    }
  }, [user, goalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Título é obrigatório")
      return
    }

    const targetNum = Number.parseFloat(targetAmount)
    if (isNaN(targetNum) || targetNum <= 0) {
      setError("Valor da meta deve ser maior que zero")
      return
    }

    const currentNum = Number.parseFloat(currentAmount)
    if (isNaN(currentNum) || currentNum < 0) {
      setError("Valor atual deve ser maior ou igual a zero")
      return
    }

    if (currentNum > targetNum) {
      setError("Valor atual não pode ser maior que o valor da meta")
      return
    }

    if (!endDate) {
      setError("Data de término é obrigatória")
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) {
      setError("Data de término deve ser posterior à data de início")
      return
    }

    if (!user) return

    setIsLoading(true)

    try {
      const goal: Goal = {
        id: goalId,
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        startDate,
        endDate,
        categoryId: categoryId === "none" ? undefined : categoryId,
        status,
        createdAt: new Date().toISOString(),
      }

      saveGoal(user.id, goal)
      router.push("/goals")
    } catch (err: any) {
      setError(err.message || "Erro ao salvar meta")
    } finally {
      setIsLoading(false)
    }
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Meta não encontrada</h1>
            <Link href="/goals">
              <Button>Voltar para metas</Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <Link href="/goals">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Editar Meta Financeira</h1>
            <p className="text-gray-500 mt-1">Atualize as informações da sua meta</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Meta</CardTitle>
              <CardDescription>Edite os dados da meta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Meta *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Viagem para Europa, Comprar carro, Fundo de emergência..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva sua meta e o que você pretende alcançar..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Amounts */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Valor da Meta (R$) *</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentAmount">Valor Atual (R$)</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria (Opcional)</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma categoria</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: Goal["status"]) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Em andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Link href="/goals">
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
