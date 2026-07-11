export const runtime = "edge";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === "login") {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return response;
  }

  if (body.action === "logout") {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete("admin_session");
    return response;
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
