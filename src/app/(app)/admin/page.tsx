import { requireAdmin } from "@/lib/auth/session"
import { listAdminUsers, startImpersonation } from "@/lib/actions/admin"
import { GrantCreditsForm } from "@/components/admin/grant-credits-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminPage() {
  const { impersonating } = await requireAdmin()
  const users = await listAdminUsers()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Админка</h1>
        <p className="text-sm text-muted-foreground">
          Начисление кредитов и вход в чужой аккаунт. Имперсонация пишет cookie только для вашей
          сессии и не работает для других админов.
        </p>
      </div>

      {impersonating ? (
        <p className="text-sm text-destructive">
          Сначала выйдите из имперсонации — список ниже всё равно ваш, админский.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Пользователи</CardTitle>
          <CardDescription>{users.length} учёток</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Роль</th>
                <th className="py-2 pr-3 font-medium">Кредиты</th>
                <th className="py-2 pr-3 font-medium">Создан</th>
                <th className="py-2 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id} className="border-b last:border-none">
                  <td className="py-3 pr-3">{row.email}</td>
                  <td className="py-3 pr-3">{row.role === "admin" ? "admin" : "user"}</td>
                  <td className="py-3 pr-3">{row.creditAccount?.balance ?? 0}</td>
                  <td className="py-3 pr-3">
                    {row.createdAt.toLocaleDateString("ru-RU")}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <GrantCreditsForm userId={row.id} />
                      {row.role !== "admin" ? (
                        <form action={startImpersonation}>
                          <input type="hidden" name="userId" value={row.id} />
                          <Button type="submit" size="sm">
                            Открыть как пользователь
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
