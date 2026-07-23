import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export const POST = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to get AI analysis." }, { status: 401 });
  }

  const body = await req.text();

  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-api-secret": process.env.INTERNAL_API_SECRET ?? "",
      "x-user-id": session.user.id,
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
};
