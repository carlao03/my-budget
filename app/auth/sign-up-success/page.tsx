import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
          <CardDescription>Enviamos um link de confirmação para seu email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Para completar seu cadastro, clique no link de confirmação que enviamos para seu email. Após confirmar, você
            poderá fazer login e começar a usar o sistema.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Voltar para o login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
