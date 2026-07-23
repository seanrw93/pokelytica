// Tests control both sides of the internal-secret check (they set this value
// and send it as a header), so it's fixed here rather than read from a real
// .env file — keeps integration tests independent of local .env presence.
process.env.INTERNAL_API_SECRET = "test-internal-secret";
