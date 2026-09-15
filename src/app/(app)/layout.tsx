import { requireCurrentUser } from "@/lib/auth/session"
import { SidebarNav } from "@/components/app-shell/sidebar-nav"
import { Topbar } from "@/components/app-shell/topbar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser()

  return (
    <div className="flex min-h-svh flex-1">
      <aside className="hidden w-64 shrink-0 border-r px-4 py-6 md:flex md:flex-col">
        <div className="mb-6 px-3 text-sm font-semibold">Career Evidence OS</div>
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userEmail={user.email} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
