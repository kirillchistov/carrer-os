"use client"

import Link from "next/link"
import type { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"
import { trackClient } from "@/lib/analytics/client"
import type { ProductEvent } from "@/lib/analytics/track"

export function CtaLink({
  href,
  variant = "default",
  size = "lg",
  className,
  children,
  onClick,
  event,
}: {
  href: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
  event?: ProductEvent
} & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      href={href}
      onClick={() => {
        if (event) trackClient(event)
        onClick?.()
      }}
      className={cn(
        buttonVariants({ variant, size }),
        "rounded-full font-semibold",
        size === "lg" && "h-12 px-6 text-base",
        className
      )}
    >
      {children}
    </Link>
  )
}
