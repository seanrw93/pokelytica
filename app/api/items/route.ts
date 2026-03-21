import { NextResponse } from "next/server";
import { getItems } from "@/lib/data";

export const GET = async () => {
    return NextResponse.json(getItems());
}