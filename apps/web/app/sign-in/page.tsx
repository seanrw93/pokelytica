"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error: signInError } = await signIn.magicLink({ email });

    if (signInError) {
      setError(signInError.message ?? "Something went wrong sending the link.");
      return;
    }

    setSent(true);
  };

  return (
    <div className="p-6 max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Sign in</h1>

      <div className="space-y-3">
        <button
          onClick={() => signIn.social({ provider: "google", callbackURL: "/team-builder" })}
          className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2 hover:bg-surface transition-colors"
        >
          Continue with Google
        </button>
        <button
          onClick={() => signIn.social({ provider: "github", callbackURL: "/team-builder" })}
          className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2 hover:bg-surface transition-colors"
        >
          Continue with GitHub
        </button>
      </div>

      <div className="text-center text-muted-light text-sm">or</div>

      {sent ? (
        <p className="text-muted-light text-sm">
          Check {email} for a sign-in link.
        </p>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            className="w-full bg-accent-yellow hover:bg-[var(--accent-yellow-hover)] text-surface px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Send magic link
          </button>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default SignInPage;
