"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { renameResume } from "@/lib/actions/resumes"

export function ResumeTitleEditor({ resumeId, initialName }: { resumeId: string; initialName: string }) {
  const [name, setName] = useState(initialName)

  return (
    <Input
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={() => {
        if (name.trim() && name !== initialName) {
          renameResume(resumeId, name.trim())
        }
      }}
      className="max-w-md border-none px-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
    />
  )
}
