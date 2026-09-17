"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"
import { authCallbackUrl, safeNextPath } from "@/lib/auth/safe-next"
import { logAuthEvent } from "@/lib/auth/log"

const credentialsSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
})

const emailSchema = z.string().email("Введите корректный email")

export type AuthActionState = { error: string | null; checkEmail?: boolean }

function nextFromForm(formData: FormData) {
  return safeNextPath(formData.get("next"))
}

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

  const next = nextFromForm(formData)
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    logAuthEvent("login_password", { ok: false, reason: error.code ?? "invalid_credentials" })
    return { error: "Неверный email или пароль" }
  }

  logAuthEvent("login_password", { ok: true })
  redirect(next)
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

  const next = nextFromForm(formData)
  const afterConfirm = next === "/dashboard" ? "/onboarding" : next
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: authCallbackUrl(env.NEXT_PUBLIC_APP_URL, afterConfirm) },
  })
  if (error) {
    logAuthEvent("signup", { ok: false, reason: error.code ?? "signup_failed" })
    return {
      error: error.message === "User already registered" ? "Этот email уже зарегистрирован" : "Не удалось создать аккаунт",
    }
  }

  if (data.session) {
    logAuthEvent("signup", { ok: true, reason: "session" })
    redirect(afterConfirm)
  }

  logAuthEvent("signup", { ok: true, reason: "needs_confirmation" })
  return { error: null, checkEmail: true }
}

export async function sendMagicLink(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректный email" }
  }

  const next = nextFromForm(formData)
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: authCallbackUrl(env.NEXT_PUBLIC_APP_URL, next) },
  })
  if (error) {
    logAuthEvent("magic_link", { ok: false, reason: error.code ?? "otp_failed" })
    return { error: "Не удалось отправить ссылку для входа" }
  }

  logAuthEvent("magic_link", { ok: true })
  return { error: null, checkEmail: true }
}

export async function sendPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = emailSchema.safeParse(formData.get("email"))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректный email" }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: authCallbackUrl(env.NEXT_PUBLIC_APP_URL, "/reset-password"),
  })
  if (error) {
    logAuthEvent("password_reset_request", { ok: false, reason: error.code ?? "reset_failed" })
    return { error: "Не удалось отправить письмо для сброса пароля" }
  }

  logAuthEvent("password_reset_request", { ok: true })
  return { error: null, checkEmail: true }
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = formData.get("password")
  const parsed = z.string().min(8, "Минимум 8 символов").safeParse(password)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Некорректный пароль" }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  if (error) {
    logAuthEvent("password_update", { ok: false, reason: error.code ?? "update_failed" })
    return { error: "Не удалось обновить пароль. Запросите новую ссылку." }
  }

  logAuthEvent("password_update", { ok: true })
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  logAuthEvent("sign_out", { ok: true })
  redirect("/login")
}
