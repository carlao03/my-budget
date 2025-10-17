import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Target, Wallet, Bell } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">FinanceApp</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Começar agora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
          Controle suas finanças de forma <span className="text-blue-600">simples e inteligente</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-pretty">
          Gerencie suas receitas, despesas e metas financeiras em um só lugar. Visualize relatórios detalhados e tome
          decisões mais conscientes sobre seu dinheiro.
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-8">
            Começar gratuitamente
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Tudo que você precisa para organizar suas finanças
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Controle de Gastos</h3>
            <p className="text-gray-600">Registre todas as suas receitas e despesas de forma rápida e organizada.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Relatórios Visuais</h3>
            <p className="text-gray-600">Visualize gráficos e relatórios detalhados sobre sua situação financeira.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Metas Financeiras</h3>
            <p className="text-gray-600">Defina objetivos e acompanhe seu progresso em direção às suas metas.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Alertas Inteligentes</h3>
            <p className="text-gray-600">Receba notificações quando seus gastos ultrapassarem os limites definidos.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para transformar suas finanças?</h2>
          <p className="text-xl mb-8 text-blue-100">Comece agora mesmo e tenha controle total sobre seu dinheiro.</p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Criar conta gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2025 FinanceApp. Sistema de Gerenciamento de Finanças Pessoais.</p>
        </div>
      </footer>
    </div>
  )
}
