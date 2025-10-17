"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Target,
  FolderOpen,
  Settings,
  LogOut,
  Wallet,
  Menu,
  X,
  Bell,
} from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getActiveAlerts } from "@/lib/alerts"
import { useAuth } from "@/lib/auth-context"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/transactions", icon: Receipt },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Metas", href: "/goals", icon: Target },
  { name: "Categorias", href: "/categories", icon: FolderOpen },
  { name: "Configurações", href: "/settings", icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    id: string
    name: string
    email: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user: contextUser, logout } = useAuth()
  const resolvedUser = user || contextUser
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [alertsCount, setAlertsCount] = useState(0)

  useEffect(() => {
    if (resolvedUser?.id) {
      const alerts = getActiveAlerts(resolvedUser.id)
      setAlertsCount(alerts.length)
    } else {
      setAlertsCount(0)
    }
  }, [resolvedUser?.id, pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-gray-900">FinanceApp</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FinanceApp</span>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {(resolvedUser?.name || resolvedUser?.email || "?").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{resolvedUser?.name || "Usuário"}</p>
                <p className="text-xs text-gray-500 truncate">{resolvedUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Alerts notification */}
          {alertsCount > 0 && (
            <div className="p-4">
              <Link href="/settings/limits" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900">{alertsCount} Alerta(s)</p>
                    <p className="text-xs text-orange-700">Limites próximos ou excedidos</p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
