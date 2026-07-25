import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./assertNoPageErrors";

const fakeSession = (overrides: Partial<{ name: string; tier: "FREE" | "PREMIUM"; image: string | null }> = {}) => {
  const now = new Date().toISOString();
  return {
    session: {
      id: "sess_1",
      token: "tok_1",
      userId: "user_1",
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      createdAt: now,
      updatedAt: now,
      ipAddress: null,
      userAgent: null,
    },
    user: {
      id: "user_1",
      name: overrides.name ?? "Ash Ketchum",
      email: "ash@example.com",
      emailVerified: true,
      image: overrides.image ?? null,
      tier: overrides.tier ?? "FREE",
      createdAt: now,
      updatedAt: now,
    },
  };
};

test("header renders on multiple pages with brand mark and primary nav", async ({ page }) => {
  const errors = trackPageErrors(page);

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Pokélytica" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

  await page.goto("/team-builder");
  await expect(page.getByRole("link", { name: "Pokélytica" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

  expect(errors).toEqual([]);
});

// /team-builder and /battle-trainer both do real, uncached server-side data
// fetching (learnsets for the full species list, dex lookups) on first hit,
// so the client-side transition can take a while longer than the default
// assertion timeout on a cold dev server — hence the extended timeouts here.
test("Team Builder nav link navigates to /team-builder", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Team Builder" }).click();
  await expect(page).toHaveURL(/\/team-builder$/, { timeout: 20_000 });
});

test("Battle a Trainer nav link navigates to /battle-trainer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Battle a Trainer" }).click();
  await expect(page).toHaveURL(/\/battle-trainer$/, { timeout: 20_000 });
});

test("Battle History is hidden from the nav for logged-out visitors", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Battle History" })).toHaveCount(0);
});

test("mobile menu opens and closes at a small viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Toggle menu" });
  await expect(toggle).toBeVisible();

  const mobileNav = page.getByRole("navigation", { name: "Mobile" });
  await expect(mobileNav).toBeHidden();

  await toggle.click();
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Team Builder" })).toBeVisible();

  await toggle.click();
  await expect(mobileNav).toBeHidden();
});

test("account menu shows Sign In when logged out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
});

test("account menu shows avatar and tier badge when a session is mocked as logged in", async ({ page }) => {
  await page.route("**/api/auth/get-session*", (route) => route.fulfill({ json: fakeSession({ tier: "PREMIUM" }) }));

  await page.goto("/");

  await expect(page.getByRole("link", { name: "Sign In" })).not.toBeVisible();
  const accountButton = page.getByRole("button", { name: /Ash Ketchum/ });
  await expect(accountButton).toBeVisible();
  await expect(accountButton.getByText("PREMIUM")).toBeVisible();

  // Battle History becomes visible in the nav once a session exists.
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Battle History" })).toBeVisible();
});
