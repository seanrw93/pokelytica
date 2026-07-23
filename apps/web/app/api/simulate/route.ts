import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export const POST = async (req: NextRequest) => {
  const body = await req.text();

  const res = await fetch(`${API_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-api-secret": process.env.INTERNAL_API_SECRET ?? "",
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
};
