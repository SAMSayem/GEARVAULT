import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return NextResponse.json({ message: "Server auth is not configured" }, { status: 500 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const token = jwt.sign({ sub: session.user.id, email: session.user.email }, secret, { expiresIn: "15m", issuer: "gearvault-web", audience: "gearvault-api" });
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
