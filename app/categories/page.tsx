"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCategories, saveCategory, deleteCategory, getTransactions } from "@/lib/data-store"
import type { Category } from "@/lib/types"
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react"
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

const availableIcons = ["🍔", "🚗", "🎮", "🏥", "📚", "🏠", "💰", "📦", "✈️", "🎬", "👕", "⚡", "💳", "🎯", "🛒"]
const availableColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#6b7280",
]

export default function CategoriesPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0])
  const [selectedColor, setSelectedColor] = useState(availableColors[0])
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = () => {
    if (user) {
      const allCategories = getCategories(user.id)
      setCategories(allCategories)
    }
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    setName("")
    setSelectedIcon(availableIcons[0])
    setSelectedColor(availableColors[0])
    setError("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setSelectedIcon(category.icon)
    setSelectedColor(category.color)
    setError("")
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    setError("")

    if (!name.trim()) {
      setError("Nome da categoria é obrigatório")
      return
    }

    // Check for duplicate names (excluding current category when editing)
    const duplicate = categories.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== editingCategory?.id,
    )

    if (duplicate) {
      setError("Já existe uma categoria com este nome")
      return
    }

    if (!user) return

    const category: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      isDefault: editingCategory?.isDefault || false,
    }

    saveCategory(user.id, category)
    loadCategories()
    setIsDialogOpen(false)
  }

  const handleDelete = () => {
    if (!user || !deleteId) return

    // Check if category has transactions
    const transactions = getTransactions(user.id)
    const hasTransactions = transactions.some((t) => t.categoryId === deleteId)

    if (hasTransactions) {
      setDeleteError("Não é possível excluir esta categoria pois existem transações associadas a ela.")
      return
    }

    deleteCategory(user.id, deleteId)
    loadCategories()
    setDeleteId(null)
    setDeleteError("")
  }

  const customCategories = categories.filter((c) => !c.isDefault)
  const defaultCategories = categories.filter((c) => c.isDefault)

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
              <p className="text-gray-500 mt-1">Gerencie as categorias das suas transações</p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Categorias Padrão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{defaultCategories.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Categorias Personalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{customCategories.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Categorias Personalizadas</CardTitle>
                <CardDescription>Categorias criadas por você</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {customCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                            <span className="text-xs text-gray-500">{category.color}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(category.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Default Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias Padrão</CardTitle>
              <CardDescription>Categorias pré-definidas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {defaultCategories.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma categoria padrão disponível</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {defaultCategories.map((category) => (
                    <div key={category.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="text-xs text-gray-500">Padrão</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Atualize as informações da categoria" : "Crie uma nova categoria personalizada"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  placeholder="Ex: Investimentos, Pets, Viagens..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        selectedIcon === icon ? "bg-blue-100 ring-2 ring-blue-600" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="grid grid-cols-7 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 w-10 rounded-lg transition-all ${
                        selectedColor === color ? "ring-2 ring-offset-2 ring-gray-900" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Pré-visualização</Label>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${selectedColor}20` }}
                  >
                    {selectedIcon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{name || "Nome da categoria"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedColor }} />
                      <span className="text-xs text-gray-500">{selectedColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>{editingCategory ? "Salvar Alterações" : "Criar Categoria"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteId}
          onOpenChange={() => {
            setDeleteId(null)
            setDeleteError("")
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteError || "Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteError("")}>Cancelar</AlertDialogCancel>
              {!deleteError && (
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
