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
