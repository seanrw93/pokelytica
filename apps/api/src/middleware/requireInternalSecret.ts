import type { Context, Next } from "koa";

// /simulate and /analyze are only meant to be called by the Next.js server
// layer (which has already verified the session for /analyze), never
// directly by a browser — this rejects anything that doesn't carry the
// shared secret only web and api know.
export const requireInternalSecret = async (ctx: Context, next: Next) => {
  const provided = ctx.get("x-internal-api-secret");
  const expected = process.env.INTERNAL_API_SECRET;

  if (!expected || provided !== expected) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  await next();
};
