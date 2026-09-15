"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { X, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

const DISMISS_KEY = "ceos:onboarding-checklist-dismissed"

function subscribe() {
  // Nothing else in this tab writes to the key, so there is no change to subscribe to.
  return () => {}
}

function getSnapshot() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    return false
  }
}

// Hidden by default on the server render, so hydration never has to reconcile a
// flash of content that immediately disappears once the client reads localStorage.
function getServerSnapshot() {
  return true
}

type Progress = {
  hasProfile: boolean
  hasCareerTrack: boolean
  hasEvidence: boolean
  hasOpportunities: boolean
}

const STEPS: { key: keyof Progress; label: string; href: string }[] = [
  { key: "hasProfile", label: "Заполнить профиль", href: "/profile" },
  { key: "hasCareerTrack", label: "Создать карьерный трек", href: "/tracks" },
  { key: "hasEvidence", label: "Добавить 3 доказательства опыта", href: "/evidence" },
  { key: "hasOpportunities", label: "Сохранить 2 целевые возможности", href: "/opportunities" },
]

export function OnboardingChecklist({ progress }: { progress: Progress }) {
  const dismissedInStorage = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [justDismissed, setJustDismissed] = useState(false)
  const dismissed = dismissedInStorage || justDismissed

  const allDone = STEPS.every((step) => progress[step.key])
  if (dismissed || allDone) return null

  function dismiss() {
    setJustDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // per-viewer convenience only — fine if unavailable
    }
  }

  return (
    <Card className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 size-7"
        onClick={dismiss}
        aria-label="Скрыть чек-лист"
      >
        <X className="size-4" />
      </Button>
      <CardHeader>
        <CardTitle className="text-base">Первые шаги</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {STEPS.map((step) => {
          const done = progress[step.key]
          return (
            <Link
              key={step.key}
              href={step.href}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-secondary/60",
                done && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  done && "border-primary bg-primary text-primary-foreground"
                )}
              >
                {done && <Check className="size-3" />}
              </span>
              {step.label}
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
