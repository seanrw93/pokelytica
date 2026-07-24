import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./assertNoPageErrors";

test("battle-results render after running a simulation", async ({ page }) => {
  const errors = trackPageErrors(page);
  test.setTimeout(180_000);

  await page.goto("/team-builder");

  // Team A: pick one Pokémon, then collapse the card so its search input
  // doesn't collide with Team B's when that card opens.
  await page.getByRole("button", { name: /Pokémon 1/ }).first().click();
  await page.getByPlaceholder("Search Pokémon...").fill("Pikachu");
  await page.getByRole("option", { name: "Pikachu", exact: true }).click();
  await page.getByPlaceholder("Search move...").first().fill("Thunderbolt");
  await page.getByRole("option", { name: "Thunderbolt", exact: true }).click();
  await page.getByRole("button", { name: /Pikachu/ }).click();

  // Team B: pick one Pokémon with a move, so the battle engine has a legal set to simulate.
  await page.getByRole("button", { name: /Pokémon 1/ }).first().click();
  await page.getByPlaceholder("Search Pokémon...").fill("Charizard");
  await page.getByRole("option", { name: "Charizard", exact: true }).click();
  await page.getByPlaceholder("Search move...").first().fill("Flamethrower");
  await page.getByRole("option", { name: "Flamethrower", exact: true }).click();

  await page.getByRole("button", { name: "Run simulation" }).click();

  // The battle engine can be slow to warm up on its first run.
  await expect(page.getByRole("heading", { name: "Results" })).toBeVisible({ timeout: 150_000 });
  await expect(page.getByText("battles simulated")).toBeVisible();
  await expect(page.getByText("Player").first()).toBeVisible();
  await expect(page.getByText("Opponent").first()).toBeVisible();

  expect(errors).toEqual([]);
});
