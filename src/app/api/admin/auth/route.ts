export const runtime = "edge";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USERNAME = "admin";
const PASSWORD = "diamond123";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === "login") {
    if (body.username === USERNAME && body.password === PASSWORD) {
      const response = NextResponse.json({ ok: true });
      response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      });
      return response;
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (body.action === "logout") {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete("admin_session");
    return response;
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
