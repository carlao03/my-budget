import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Categorize the request path once so we can allow Next.js internal endpoints (e.g. server actions)
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isAuthFlow = pathname.startsWith("/auth")
  const isLanding = pathname === "/"
  const isNextInternal = pathname.startsWith("/_next") || pathname === "/favicon.ico"

  // Redirect to login if not authenticated and trying to access protected routes
  if (!user && !isAuthPage && !isAuthFlow && !isLanding && !isNextInternal) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if authenticated and trying to access login/register
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
