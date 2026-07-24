import type { Page } from "@playwright/test";

// Attaches a listener that fails the test if the page throws an uncaught
// exception (the actual "renders without throwing" check, not just "some
// DOM happened to be visible").
export const trackPageErrors = (page: Page) => {
  const errors: Error[] = [];
  page.on("pageerror", (err) => errors.push(err));
  return errors;
};
