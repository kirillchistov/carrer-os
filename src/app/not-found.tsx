import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <h1 className="font-heading text-2xl font-semibold">Страница не найдена</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Такой страницы нет — проверьте адрес или вернитесь на главную.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        На главную
      </Button>
    </main>
  )
}
