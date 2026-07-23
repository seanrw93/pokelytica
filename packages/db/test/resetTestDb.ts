import resetTestDb from "./globalSetup";

// Standalone entrypoint (not run through Vitest's globalSetup hook). Multiple
// vitest projects (db, api) now share the same test database, and Vitest can
// run projects concurrently — if each project reset the DB via its own
// globalSetup, one project's reset could wipe data mid-run for the other.
// Running the reset once, up front, as its own step before `vitest run`
// starts removes that race entirely.
await resetTestDb();
