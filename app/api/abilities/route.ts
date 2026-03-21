import { NextResponse } from "next/server";
import { dex } from "@/lib/dex";

export const GET = async () => {
  const abilities = dex.abilities.all().map(a => ({
    id: a.id,
    name: a.name,
    shortDesc: a.shortDesc,
  }));

  return NextResponse.json(abilities);
}