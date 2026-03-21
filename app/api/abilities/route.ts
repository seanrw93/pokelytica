import { NextResponse } from "next/server";
import { getAbilities } from "@/lib/data";

export const GET = async () => {
    return NextResponse.json(getAbilities());
}