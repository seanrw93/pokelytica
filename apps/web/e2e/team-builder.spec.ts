import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./assertNoPageErrors";

test("team-builder page renders without throwing", async ({ page }) => {
  const errors = trackPageErrors(page);

  await page.goto("/team-builder");

  await expect(page.getByRole("heading", { name: "Team Builder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Player" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Opponent/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run simulation" })).toBeVisible();

  // Six collapsible Pokémon slots on each side.
  await expect(page.getByText(/^Pokémon \d$/)).toHaveCount(12);

  expect(errors).toEqual([]);
});
