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
} from "lucide-react"
import { cn } from "cn"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/evidence", label: "Evidence Bank", icon: FolderKanban },
  { href: "/tracks", label: "Career Tracks", icon: Compass },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
] as const

export function SidebarNav({ className }: { className?: string }) {
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
    </nav>
  )
}
