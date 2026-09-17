import Link from "next/link"
import type { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function CtaLink({
  href,
  variant = "default",
  size = "lg",
  className,
  children,
  onClick,
}: {
  href: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
} & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      href={href}
      onClick={onClick}
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
