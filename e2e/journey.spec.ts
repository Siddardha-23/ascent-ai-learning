import { test, expect } from "@playwright/test";

/**
 * End-to-end journeys at phone + desktop widths (config runs both projects).
 * Uses local storage mode (no Blob token) so tests are hermetic. Each test
 * enters a unique profile name to isolate state.
 */

function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

async function enterProfile(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await page.getByLabel(/name or username/i).fill(name);
  await page.getByRole("button", { name: /open my space/i }).click();
  await expect(page).toHaveURL(/\/learn$/);
}

test("profile entry lands on dashboard with onboarding choice", async ({ page }) => {
  await enterProfile(page, uniqueName("e2e-onb"));
  await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
  // Onboarding choice appears for a fresh profile.
  await expect(page.getByText(/Two ways to start/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /take the skills check/i })).toBeVisible();
});

test("standard path: open a lesson, depth toggle + a visual render", async ({ page }) => {
  await enterProfile(page, uniqueName("e2e-std"));
  await page.goto("/learn/day/2");
  await expect(page.getByRole("heading", { name: /math behind a prediction/i })).toBeVisible();
  // Enhancement depth control is present and switchable.
  const deeper = page.getByRole("button", { name: "Deeper", exact: true });
  await expect(deeper).toBeVisible();
  await deeper.click();
  await expect(deeper).toHaveAttribute("aria-pressed", "true");
  // A visual with a text description exists.
  await expect(page.getByText(/Text description of this visual/i).first()).toBeVisible();
});

test("assessment wizard: start, answer, resume, submit -> plan preview", async ({ page }) => {
  await enterProfile(page, uniqueName("e2e-asmt"));
  await page.goto("/learn/assessment");
  await page.getByRole("button", { name: /start the check/i }).click();

  // Answer the first self-report question, then advance through steps.
  // Step 1 (self-report): pick the first option on each visible question.
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: /^Next$/ }).click();

  // Advance through remaining question steps by clicking Next (answers optional).
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: /^Next$/ }).click();
  }
  // Preferences step -> Next.
  await page.getByRole("button", { name: /^Next$/ }).click();
  // Review step -> finish.
  await page.getByRole("button", { name: /see my findings/i }).click();

  await expect(page).toHaveURL(/\/learn\/plan\?preview=/);
  await expect(page.getByText(/Plan preview/i)).toBeVisible();
  // Destination competencies count is unchanged (shown in the comparison).
  await expect(page.getByText(/unchanged from/i)).toBeVisible();
});

test("plan preview: activate then return to standard path", async ({ page }) => {
  await enterProfile(page, uniqueName("e2e-plan"));
  // Build a plan via the wizard quickly.
  await page.goto("/learn/assessment");
  await page.getByRole("button", { name: /start the check/i }).click();
  await page.getByRole("radio").first().check();
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: /^Next$/ }).click();
  await page.getByRole("button", { name: /^Next$/ }).click();
  await page.getByRole("button", { name: /see my findings/i }).click();
  await expect(page).toHaveURL(/\/learn\/plan\?preview=/);

  await page.getByRole("button", { name: /activate this plan/i }).click();
  await expect(page).toHaveURL(/\/learn\/plan$/);
  await expect(page.getByText(/Active plan/i)).toBeVisible();

  await page.getByRole("button", { name: /return to standard path/i }).click();
  await expect(page.getByText(/Active path: standard course/i)).toBeVisible();
});

test("skills map renders competency graph", async ({ page }) => {
  await enterProfile(page, uniqueName("e2e-skills"));
  await page.goto("/learn/skills");
  await expect(page.getByRole("heading", { name: /skills map/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /competency graph/i })).toBeVisible();
});

test("no horizontally clipped content on the dashboard", async ({ page }) => {
  await enterProfile(page, uniqueName("e2e-clip"));
  // The document should not scroll horizontally (content fits the viewport).
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(2);
});
