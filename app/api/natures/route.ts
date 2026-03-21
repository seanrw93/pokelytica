import { NextResponse } from "next/server";
import { dex } from "@/lib/dex";

export const GET = async () => {
    const natures = dex.natures.all().map(n => ({
        id: n.id,
        name: n.name,
        plus: n.plus,
        minus: n.minus
    }))

    return NextResponse.json(natures);
}