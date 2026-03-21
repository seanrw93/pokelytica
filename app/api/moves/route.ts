import { NextResponse } from "next/server";
import { getMoves } from "@/lib/data";

export const GET = async () => {
    return NextResponse.json(getMoves());
}