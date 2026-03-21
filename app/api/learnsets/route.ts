import { NextResponse } from "next/server";
import { dex } from "@/lib/dex";

export const GET = async () => {
const learnsets = await Promise.all(
  dex.species.all().map(async species => {
    const ls = await dex.learnsets.get(species.id);
    return {
      id: species.id,
      learnset: ls?.learnset ?? {}
    };
  })
);

  return NextResponse.json(learnsets);
};
