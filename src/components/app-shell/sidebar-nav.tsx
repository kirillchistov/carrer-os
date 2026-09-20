"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Compass,
  FileText,
  Briefcase,
  Kanban,
  BookOpen,
  Settings,
  Sparkles,
  Shield,
} from "lucide-react"
import { cn } from "cn"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/quick-tailor", label: "Экспресс-тюнинг", icon: Sparkles },
  { href: "/profile", label: "Профиль", icon: User },
  { href: "/evidence", label: "Доказательства", icon: FolderKanban },
  { href: "/tracks", label: "Карьерные треки", icon: Compass },
  { href: "/resumes", label: "Резюме", icon: FileText },
  { href: "/opportunities", label: "Возможности", icon: Briefcase },
  { href: "/pipeline", label: "Воронка", icon: Kanban },
  { href: "/resources", label: "Материалы", icon: BookOpen },
  { href: "/settings", label: "Настройки", icon: Settings },
] as const

export function SidebarNav({ className, showAdmin }: { className?: string; showAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        )
      })}
      {showAdmin ? (
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/admin" || pathname.startsWith("/admin/")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          )}
        >
          <Shield className="size-4 shrink-0" aria-hidden />
          Админка
        </Link>
      ) : null}
    </nav>
  )
}
