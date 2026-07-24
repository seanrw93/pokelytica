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

test("running a simulation with no moves selected shows a validation error instead of submitting", async ({ page }) => {
  const errors = trackPageErrors(page);

  await page.goto("/team-builder");

  // Team A: species picked, but no move selected.
  await page.getByRole("button", { name: /Pokémon 1/ }).first().click();
  await page.getByPlaceholder("Search Pokémon...").fill("Pikachu");
  await page.getByRole("option", { name: "Pikachu", exact: true }).click();
  await page.getByRole("button", { name: /Pikachu/ }).click();

  // Team B: same, incomplete.
  await page.getByRole("button", { name: /Pokémon 1/ }).first().click();
  await page.getByPlaceholder("Search Pokémon...").fill("Charizard");
  await page.getByRole("option", { name: "Charizard", exact: true }).click();

  await page.getByRole("button", { name: "Run simulation" }).click();

  await expect(page.getByText(/needs at least one move selected/)).toBeVisible();
  // No results should appear — the request was never sent.
  await expect(page.getByRole("heading", { name: "Results" })).not.toBeVisible();

  expect(errors).toEqual([]);
});
