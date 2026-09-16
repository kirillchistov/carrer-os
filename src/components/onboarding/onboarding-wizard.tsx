"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import type { Experience } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "cn"
import { ProfileForm } from "@/components/profile/profile-form"
import { ExperienceImportPanel } from "@/components/experience/experience-import-panel"
import { ExperienceList } from "@/components/experience/experience-list"
import { CareerTrackForm } from "@/components/career-tracks/career-track-form"
import { createCareerTrack } from "@/lib/actions/career-tracks"
import { markOnboardingCompleted } from "@/lib/actions/onboarding"
import { careerTrackFormDefaults } from "@/lib/validation/career-track"
import type { ProfileFormValues } from "@/lib/validation/profile"

const STEPS = ["Профиль", "Опыт", "Карьерный трек", "Готово"] as const

export function OnboardingWizard({
  initialProfileValues,
  initialExperiences,
}: {
  initialProfileValues: ProfileFormValues
  initialExperiences: Experience[]
}) {
  const [step, setStep] = useState(0)
  const experiences = initialExperiences
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex gap-4 text-sm">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-1.5",
              i === step ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border text-xs",
                i < step && "border-primary bg-primary text-primary-foreground",
                i === step && "border-foreground"
              )}
            >
              {i < step ? <Check className="size-3" /> : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Расскажите о себе</CardTitle>
            <CardDescription>
              Основные данные и предпочтения — их можно будет уточнить позже в разделе Profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm initialValues={initialProfileValues} onSuccess={() => setStep(1)} />
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <ExperienceImportPanel />
          {experiences.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Проверьте извлечённый опыт</h3>
              <ExperienceList experiences={experiences} />
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Назад
            </Button>
            <Button onClick={() => setStep(2)}>Далее</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Первый карьерный трек</CardTitle>
            <CardDescription>
              Например, целевая должность или тип проектной занятости. Остальные треки можно
              добавить позже в разделе Career Tracks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CareerTrackForm
              defaultValues={careerTrackFormDefaults}
              submitLabel="Создать и продолжить"
              onSubmit={async (values) => {
                await createCareerTrack(values)
                await markOnboardingCompleted()
                setStep(3)
              }}
            />
            <Button variant="ghost" className="mt-2" onClick={() => setStep(1)}>
              Назад
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Готово</CardTitle>
            <CardDescription>
              Профиль, опыт и первый карьерный трек сохранены. Дальше — добавьте доказательства
              опыта в Evidence Bank и первую возможность в Opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>Перейти на Dashboard</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
