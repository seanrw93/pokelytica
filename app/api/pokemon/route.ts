import { NextResponse } from "next/server";
import { getPokemon } from "@/lib/data";

export const GET = async () => {
  return NextResponse.json(getPokemon());
};