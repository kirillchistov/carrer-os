"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InterviewForm } from "@/components/interviews/interview-form"
import { updateInterview } from "@/lib/actions/interviews"
import type { InterviewFormValues } from "@/lib/validation/interview"

export function EditInterviewCard({
  interviewId,
  defaultValues,
}: {
  interviewId: string
  defaultValues: InterviewFormValues
}) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Детали интервью</CardTitle>
      </CardHeader>
      <CardContent>
        <InterviewForm
          defaultValues={defaultValues}
          onSubmit={async (values) => {
            await updateInterview(interviewId, values)
            toast.success("Сохранено")
            router.refresh()
          }}
        />
      </CardContent>
    </Card>
  )
}
