import { MarketingHeader } from "@/components/marketing/header"
import { MarketingFooter } from "@/components/marketing/footer"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex min-h-svh flex-1 flex-col bg-background text-foreground">
      <MarketingHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <MarketingFooter />
    </div>
  )
}
