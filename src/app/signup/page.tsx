import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Регистрация</CardTitle>
          <CardDescription>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Войти
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </main>
  )
}
