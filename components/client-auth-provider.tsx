"use client"

import { AuthProvider } from "@/lib/auth-context"
import { useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name?: string | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const readStoredUser = () => {
      try {
        const stored = localStorage.getItem("currentUser")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && typeof parsed === "object" && parsed.id && parsed.email) {
            return parsed as { id: string; email: string; name?: string | null }
          }
        }
      } catch (error) {
        console.error("[v0] ClientAuthProvider: Error parsing stored user", error)
      }
      return null
    }

    const persistUser = (value: { id: string; email: string; name?: string | null } | null) => {
      if (!value) {
        localStorage.removeItem("currentUser")
        return
      }
      localStorage.setItem("currentUser", JSON.stringify(value))
    }

    const syncUserFromSession = async () => {
      try {
        setIsLoading(true)
        const storedUser = readStoredUser()
        if (storedUser) {
          setUser(storedUser)
        }
        const {
          data: { user: sessionUser },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          if (error.message && error.message.toLowerCase().includes("auth session missing")) {
            setUser(null)
            persistUser(null)
            return
          }
          console.error("[v0] ClientAuthProvider: Error fetching session", error)
          setUser(null)
          persistUser(null)
          return
        }

        if (sessionUser) {
          const normalizedUser = {
            id: sessionUser.id,
            email: sessionUser.email || "",
            name:
              sessionUser.user_metadata?.name ?? storedUser?.name ?? sessionUser.email ?? "",
          }
          setUser(normalizedUser)
          persistUser(normalizedUser)
        } else {
          setUser(null)
          persistUser(null)
        }
      } catch (error) {
        console.error("[v0] ClientAuthProvider: Unexpected error syncing session", error)
        setUser(null)
        persistUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    syncUserFromSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const storedUser = readStoredUser()
      if (session?.user) {
        const normalizedUser = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.name ?? storedUser?.name ?? session.user.email ?? "",
        }
        setUser(normalizedUser)
        persistUser(normalizedUser)
      } else {
        setUser(null)
        persistUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthProvider initialUser={user} initialIsLoading={isLoading}>
      {children}
    </AuthProvider>
  )
}
