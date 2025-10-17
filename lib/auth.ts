import { createServerClient } from "@/lib/supabase/server"
import { cache } from "react"
import { redirect } from "next/navigation"

export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("[v0] Error getting user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("[v0] Exception getting user:", error)
    return null
  }
})

export async function requireAuth() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect("/login")
    }
    return user
  } catch (error) {
    console.error("[v0] Error in requireAuth:", error)
    redirect("/login")
  }
}

export async function isAuthenticated() {
  try {
    const user = await getCurrentUser()
    return !!user
  } catch (error) {
    console.error("[v0] Error checking authentication:", error)
    return false
  }
}
