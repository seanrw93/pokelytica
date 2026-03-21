import { NextResponse } from "next/server";
import { dex } from "@/lib/dex";

export const GET = async () => {
  const items = dex.items.all().map(i => ({
    id: i.id,
    name: i.name,
    shortDesc: i.shortDesc,
  }));

  return NextResponse.json(items);
}