"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { CtaLink } from "@/components/marketing/cta-link"

const NAV = [
  { href: "/#how", label: "Как это работает" },
  { href: "/#express", label: "Экспресс-тюнинг" },
  { href: "/#who", label: "Для кого" },
  { href: "/#faq", label: "FAQ" },
] as const

export function MarketingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-sans text-sm font-semibold tracking-tight">
          <span className="size-2.5 rounded-full bg-primary" aria-hidden />
          Career Evidence OS
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Войти
          </Link>
          <CtaLink href="/try" size="sm" className="px-4" event="landing_cta_click">
            Начать
          </CtaLink>
        </div>

        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="text-muted-foreground" onClick={() => setOpen(false)}>
              Войти
            </Link>
            <CtaLink href="/try" className="mt-1 w-full" event="landing_cta_click" onClick={() => setOpen(false)}>
              Начать
            </CtaLink>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
