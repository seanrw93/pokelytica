import { NextResponse } from "next/server";
import { getLearnsets } from "@/lib/data";

export const GET = async () => {
    return NextResponse.json(getLearnsets());
}