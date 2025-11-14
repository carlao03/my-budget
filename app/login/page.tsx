"use client"

import type React from "react"
import { useState } from "react"
import { loginAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("[v0] Login: Starting login process for", email)

    try {
      const result = await loginAction(email, password)

      console.log("[v0] Login: Result from loginAction:", result)
      console.log("[v0] Login: Result type:", typeof result)
      console.log("[v0] Login: Result keys:", result ? Object.keys(result) : "null")

      if (result === undefined) {
        console.log("[v0] Login: Result undefined, assuming middleware redirect handled navigation")
        router.push("/dashboard")
        router.refresh()
        setIsLoading(false)
        return
      }

      if (result?.error) {
        console.log("[v0] Login: Error occurred:", result.error)
        setError(result.error)
        setIsLoading(false)
      } else if (result?.success) {
        const user = "user" in result ? result.user : undefined

        if (user) {
          console.log("[v0] Login: Success! Saving user to localStorage:", user)
          localStorage.setItem("currentUser", JSON.stringify(user))

          const saved = localStorage.getItem("currentUser")
          console.log("[v0] Login: Verified localStorage:", saved)
        } else {
          console.log("[v0] Login: Success without user payload, relying on Supabase session")
        }

        console.log("[v0] Login: Redirecting to dashboard")
        router.push("/dashboard")
        router.refresh()
        setIsLoading(false)
      } else {
        console.log("[v0] Login: Unexpected result format:", result)
        setError("Erro inesperado ao fazer login")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("[v0] Login: Exception caught:", error)
      setError("Erro de comunicação com o servidor")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-center">Entre com suas credenciais para acessar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
