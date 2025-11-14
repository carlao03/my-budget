"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function loginAction(email: string, password: string) {
  console.log("[v0] loginAction: Starting login for", email)

  try {
    const supabase = await createServerClient()
    console.log("[v0] loginAction: Supabase client created")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("[v0] loginAction: Supabase response - error:", error, "user:", data?.user?.id)

    if (error) {
      console.error("[v0] loginAction error:", error)
      console.log("[v0] loginAction: Returning error:", error.message)
      return { error: error.message }
    }

    if (data.user) {
      const result = {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || email,
          name: (data.user.user_metadata as any)?.name || data.user.email || email,
        },
      }
      console.log("[v0] loginAction: Returning success:", result)
      return result
    }

    console.error("[v0] loginAction: No user in response for", email)
    return { error: "Erro ao fazer login" }
  } catch (err: any) {
    console.error("[v0] loginAction exception:", err)
    return { error: err.message || "Erro ao fazer login" }
  }
}

export async function registerAction(email: string, password: string, name: string) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
        data: {
          name,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Erro ao criar conta" }
  }
}

export async function logoutAction() {
  try {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[v0] logoutAction: Error signing out", error)
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/login")
  } catch (error: any) {
    console.error("[v0] logoutAction: Exception", error)
    return { error: error.message || "Erro ao fazer logout" }
  }
}
