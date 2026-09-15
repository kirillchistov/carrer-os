"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"

const credentialsSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
})

export type AuthActionState = { error: string | null }

export async function signInWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    return { error: "Неверный email или пароль" }
  }

  redirect("/dashboard")
}

export async function signUpWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректные данные" }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback` },
  })
  if (error) {
    return { error: error.message === "User already registered" ? "Этот email уже зарегистрирован" : "Не удалось создать аккаунт" }
  }

  redirect("/onboarding")
}

const emailSchema = z.string().email("Введите корректный email")

export async function sendMagicLink(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректный email" }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback` },
  })
  if (error) {
    return { error: "Не удалось отправить ссылку для входа" }
  }

  return { error: null }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
