"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

interface AuthUser {
  id: string
  email: string
  name?: string | null
}

interface AuthContextType {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
  initialUser,
  initialIsLoading = false,
}: {
  children: ReactNode
  initialUser?: AuthUser | null
  initialIsLoading?: boolean
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser || null)
  const [isLoading, setIsLoading] = useState(initialIsLoading)

  useEffect(() => {
    setUser(initialUser ?? null)
  }, [initialUser])

  useEffect(() => {
    setIsLoading(initialIsLoading)
  }, [initialIsLoading])

  const logout = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem("currentUser")
      window.location.href = "/login"
    } catch (err) {
      console.error("[v0] Error during logout:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
