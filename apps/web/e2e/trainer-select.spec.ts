import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./assertNoPageErrors";

test("trainer-select page renders without throwing", async ({ page }) => {
  const errors = trackPageErrors(page);

  await page.goto("/battle-trainer");

  await expect(page.getByRole("heading", { name: "Battle a trainer" })).toBeVisible();
  await expect(page.getByPlaceholder("Search trainers...")).toBeVisible();
  await expect(page.getByRole("combobox").first()).toBeVisible();

  expect(errors).toEqual([]);
});

test("trainer-select search narrows results without throwing", async ({ page }) => {
  const errors = trackPageErrors(page);

  await page.goto("/battle-trainer");
  await page.getByPlaceholder("Search trainers...").fill("zzz-no-such-trainer");

  await expect(page.getByText("No trainers match your search or filters.")).toBeVisible();

  expect(errors).toEqual([]);
});

test("picking a trainer preloads their real team into the opponent slots", async ({ page }) => {
  const errors = trackPageErrors(page);

  await page.goto("/team-builder?trainer=Brock");

  await expect(page.getByRole("heading", { name: "Opponent: Brock" })).toBeVisible();
  // Brock's actual seeded roster, not the "Pokémon N" placeholder — proves the
  // opponent cards read initial data from the loaded trainer instead of
  // rendering blank while the simulation payload silently has the real team.
  await expect(page.getByRole("button", { name: /Geodude/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Onix/ })).toBeVisible();
  await expect(page.getByText(/Geodude.*Lv50/)).toBeVisible();

  expect(errors).toEqual([]);
});
