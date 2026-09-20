"use client"

import type { ProductEvent } from "./track"

export function trackClient(event: ProductEvent, properties?: Record<string, string | number | boolean>) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  void import("posthog-js").then((mod) => {
    const posthog = mod.default
    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
        capture_pageview: false,
        persistence: "localStorage+cookie",
      })
    }
    posthog.capture(event, properties)
  })
}
