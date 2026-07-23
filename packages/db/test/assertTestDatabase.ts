const EXPECTED_HOSTS = ["localhost", "127.0.0.1"];
const EXPECTED_PORT = "5433";
const EXPECTED_DATABASE = "pokelytica_test";

// Hard guard against ever running the destructive schema reset in
// globalSetup.ts against anything but the dedicated test container.
// Fails loudly and unconditionally — no prompting, safe to run unattended in CI.
export const assertTestDatabaseUrl = (rawUrl: string | undefined) => {
  if (!rawUrl) {
    throw new Error(
      "DATABASE_URL is not set. Refusing to run the test database reset.",
    );
  }

  const url = new URL(rawUrl);
  const port = url.port || "5432";
  const database = url.pathname.replace(/^\//, "");

  const matches =
    EXPECTED_HOSTS.includes(url.hostname) &&
    port === EXPECTED_PORT &&
    database === EXPECTED_DATABASE;

  if (!matches) {
    throw new Error(
      `Refusing to run the destructive test database reset: DATABASE_URL does not point at the ` +
        `dedicated test container (expected host in [${EXPECTED_HOSTS.join(", ")}], port ${EXPECTED_PORT}, ` +
        `database "${EXPECTED_DATABASE}"). Got host="${url.hostname}", port="${port}", database="${database}". ` +
        `This check exists to prevent "prisma db push --force-reset" from ever running against a real database.`,
    );
  }
};
