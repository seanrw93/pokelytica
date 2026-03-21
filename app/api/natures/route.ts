import { NextResponse } from "next/server";
import { getNatures } from "@/lib/data";

export const GET = async () => {
    return NextResponse.json(getNatures());
}