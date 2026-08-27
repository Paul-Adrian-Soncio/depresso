import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isPeriod } from "@/lib/domain/period";

const COOKIE_NAME = "depresso-period";

export async function POST(request: Request) {
  const { period, manual } = await request.json();

  if (!isPeriod(period)) {
    return NextResponse.json({ error: "invalid period" }, { status: 400 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, period, {
    maxAge: manual ? 60 * 60 * 24 * 365 : 60 * 60 * 6,
    sameSite: "lax",
  });

  return NextResponse.json({ period });
}
