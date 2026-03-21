import { NextResponse } from "next/server";
import { dex } from "@/lib/dex";

export const GET = async () => {
  const moves = dex.moves.all().map(m => ({
    id: m.id,
    name: m.name,
    type: m.type,
    category: m.category,
    power: m.basePower,
    accuracy: m.accuracy,
    priority: m.priority,
    target: m.target,
  }));

  return NextResponse.json(moves);
}