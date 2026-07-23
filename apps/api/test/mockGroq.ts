import { vi } from "vitest";

// Groq's SDK validates apiKey eagerly at construction time, so any test file
// that imports src/app (even indirectly, e.g. via the health check) needs a
// working mock — real GROQ_API_KEY should never be required to run tests,
// and no test should ever perform a real network call to Groq.
export const mockCreateCompletion = vi.fn().mockResolvedValue({
  choices: [{ message: { content: "mock analysis" } }],
});

vi.mock("groq-sdk", () => ({
  default: class MockGroq {
    chat = { completions: { create: mockCreateCompletion } };
  },
}));
