"use client"

import { useEffect, useState } from "react"
import { getActiveAlerts, type Alert } from "@/lib/alerts"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AlertsBanner({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (userId) {
      const activeAlerts = getActiveAlerts(userId)
      setAlerts(activeAlerts)
    }
  }, [userId])

  const visibleAlerts = alerts.filter((alert) => !dismissed.has(alert.id))

  if (visibleAlerts.length === 0) return null

  return (
    <div className="space-y-2 mb-6">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${
            alert.severity === "danger"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-orange-50 border-orange-200 text-orange-900"
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className={`h-5 w-5 ${alert.severity === "danger" ? "text-red-600" : "text-orange-600"}`} />
            <div className="flex-1">
              <p className="font-medium">
                {alert.severity === "danger" ? "Limite ultrapassado!" : "Atenção: Próximo do limite"}
              </p>
              <p className="text-sm mt-1">
                {alert.categoryIcon} {alert.categoryName}: R$ {alert.currentAmount.toFixed(2)} de R${" "}
                {alert.limitAmount.toFixed(2)} ({alert.percentage.toFixed(0)}%) -{" "}
                {alert.period === "monthly" ? "Mensal" : "Semanal"}
              </p>
            </div>
            <Link href="/settings/limits">
              <Button variant="ghost" size="sm">
                Gerenciar limites
              </Button>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed((prev) => new Set(prev).add(alert.id))}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
