import { test, expect } from "@playwright/test"

test.describe("funnel to express tailor", () => {
  test("landing CTA opens /try then login gate for the wizard", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Адаптировать резюме" }).first().click()
    await expect(page).toHaveURL(/\/try/)
    await expect(page.getByRole("heading", { name: /Войти и сразу к вакансии/ })).toBeVisible()

    await page.getByRole("link", { name: "Создать аккаунт" }).click()
    await expect(page).toHaveURL(/\/signup\?next=/)
  })

  test("unauthenticated /quick-tailor redirects to login with next", async ({ page }) => {
    await page.goto("/quick-tailor")
    await expect(page).toHaveURL(/\/login\?next=/)
    expect(page.url()).toContain("quick-tailor")
  })
})
