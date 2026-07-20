import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, setSessionCookie, publicUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const normEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normEmail } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "No account matches that email and password." }, { status: 401 });
  }

  setSessionCookie(signToken(user.id));
  return NextResponse.json({ user: publicUser(user) });
}
