import { requireCurrentUser } from "@/lib/auth/session"
import { SidebarNav } from "@/components/app-shell/sidebar-nav"
import { Topbar } from "@/components/app-shell/topbar"
import { getCreditBalanceForUser } from "@/lib/queries/credits"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser()
  const creditBalance = await getCreditBalanceForUser(user.id)

  return (
    <div className="flex min-h-svh flex-1 bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-2 px-3">
          <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
          <span className="font-heading text-sm font-semibold text-sidebar-foreground">
            Career Evidence OS
          </span>
        </div>
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userEmail={user.email} creditBalance={creditBalance} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
