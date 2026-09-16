import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ExportButtons({ exportUrl }: { exportUrl: string }) {
  return (
    <>
      <Button variant="outline" nativeButton={false} render={<a href={exportUrl} />}>
        <Download className="size-4" />
        .docx
      </Button>
      <Button variant="outline" nativeButton={false} render={<a href={`${exportUrl}?format=pdf`} />}>
        <Download className="size-4" />
        .pdf
      </Button>
    </>
  )
}
