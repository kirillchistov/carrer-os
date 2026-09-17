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
import { listMyExperiences } from "@/lib/actions/experience"
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
  const [experiences, setExperiences] = useState(initialExperiences)
  const [confirmSkipExperience, setConfirmSkipExperience] = useState(false)
  const router = useRouter()

  async function refreshExperiences() {
    const next = await listMyExperiences()
    setExperiences(next)
    setConfirmSkipExperience(false)
  }

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
              Основные данные и предпочтения — их можно будет уточнить позже в профиле.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm initialValues={initialProfileValues} onSuccess={() => setStep(1)} />
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <ExperienceImportPanel onImported={refreshExperiences} />
          {experiences.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Проверьте извлечённый опыт</h3>
              <ExperienceList experiences={experiences} />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Назад
            </Button>
            <div className="flex flex-col items-end gap-1">
              {experiences.length === 0 && confirmSkipExperience ? (
                <p className="max-w-xs text-right text-xs text-muted-foreground">
                  Опыт можно добавить позже в профиле. Нажмите ещё раз, чтобы продолжить.
                </p>
              ) : null}
              <Button
                onClick={() => {
                  if (experiences.length === 0 && !confirmSkipExperience) {
                    setConfirmSkipExperience(true)
                    return
                  }
                  setStep(2)
                }}
              >
                {experiences.length === 0 ? "Продолжить без опыта" : "Далее"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Первый карьерный трек</CardTitle>
            <CardDescription>
              Например, целевая должность или тип проектной занятости. Остальные треки можно
              добавить позже в разделе «Карьерные треки».
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
              и первую возможность.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>На дашборд</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
