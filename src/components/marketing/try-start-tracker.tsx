"use client"

import { useEffect } from "react"
import { trackClient } from "@/lib/analytics/client"

export function TryStartTracker() {
  useEffect(() => {
    trackClient("try_started")
  }, [])
  return null
}
