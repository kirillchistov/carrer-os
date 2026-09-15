"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarNav } from "@/components/app-shell/sidebar-nav"
import { signOut } from "@/lib/actions/auth"

export function Topbar({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden"
            render={<Button variant="ghost" size="icon" aria-label="Открыть меню" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-4">
            <SheetTitle className="mb-4 font-heading text-sm font-semibold text-sidebar-foreground">
              Career Evidence OS
            </SheetTitle>
            <SidebarNav />
          </SheetContent>
        </Sheet>
        <span className="font-heading text-sm font-semibold md:hidden">Career Evidence OS</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">{userEmail}</span>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Выйти
          </Button>
        </form>
      </div>
    </header>
  )
}
