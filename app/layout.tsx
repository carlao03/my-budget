import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientAuthProvider } from "@/components/client-auth-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "FinanceApp - Gerenciamento de Finanças Pessoais",
  description: "Controle suas receitas, despesas e metas financeiras de forma simples e inteligente",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased">
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  )
}
