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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { saveTransaction, getTransactions, getCategories } from "@/lib/data-store"
import type { Transaction, TransactionType } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditTransactionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const transactionId = params.id as string

  const [type, setType] = useState<TransactionType>("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<"weekly" | "monthly">("monthly")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const categories = user ? getCategories(user.id) : []

  useEffect(() => {
    if (user && transactionId) {
      const transactions = getTransactions(user.id)
      const transaction = transactions.find((t) => t.id === transactionId)

      if (transaction) {
        setType(transaction.type)
        setDescription(transaction.description)
        setAmount(transaction.amount.toString())
        setDate(transaction.date)
        setCategoryId(transaction.categoryId)
        setPaymentMethod(transaction.paymentMethod || "")
        setIsRecurring(transaction.isRecurring)
        setRecurrenceFrequency(transaction.recurrenceFrequency || "monthly")
      } else {
        setNotFound(true)
      }
    }
  }, [user, transactionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!description.trim()) {
      setError("Descrição é obrigatória")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Valor deve ser maior que zero")
      return
    }

    if (!categoryId) {
      setError("Selecione uma categoria")
      return
    }

    if (!user) return

    setIsLoading(true)

    try {
      const transaction: Transaction = {
        id: transactionId,
        userId: user.id,
        type,
        description: description.trim(),
        amount: amountNum,
        date,
        categoryId,
        paymentMethod: paymentMethod.trim() || undefined,
        isRecurring,
        recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
        createdAt: new Date().toISOString(),
      }

      saveTransaction(user.id, transaction)
      router.push("/transactions")
    } catch (err: any) {
      setError(err.message || "Erro ao salvar transação")
    } finally {
      setIsLoading(false)
    }
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Transação não encontrada</h1>
            <Link href="/transactions">
              <Button>Voltar para transações</Button>
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
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Editar Transação</h1>
            <p className="text-gray-500 mt-1">Atualize as informações da transação</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Transação</CardTitle>
              <CardDescription>Edite os dados da transação</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="space-y-2">
                  <Label>Tipo de Transação</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setType("income")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        type === "income"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">💰</div>
                      <div className="font-semibold">Receita</div>
                      <div className="text-sm text-gray-500">Entrada de dinheiro</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        type === "expense"
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">💸</div>
                      <div className="font-semibold">Despesa</div>
                      <div className="text-sm text-gray-500">Saída de dinheiro</div>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Salário, Supermercado, Conta de luz..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Amount and Date */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
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

                {/* Payment Method */}
                {type === "expense" && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                    <Input
                      id="paymentMethod"
                      placeholder="Ex: Cartão de crédito, Dinheiro, PIX..."
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                  </div>
                )}

                {/* Recurring */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={isRecurring}
                      onCheckedChange={(checked) => setIsRecurring(!!checked)}
                    />
                    <Label htmlFor="recurring" className="cursor-pointer">
                      Esta é uma transação recorrente
                    </Label>
                  </div>

                  {isRecurring && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="frequency">Frequência</Label>
                      <Select value={recurrenceFrequency} onValueChange={(value: any) => setRecurrenceFrequency(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Link href="/transactions">
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
