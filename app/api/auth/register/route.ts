import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, setSessionCookie, publicUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Fill in every field — password needs at least 6 characters." },
      { status: 400 }
    );
  }

  const normEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "An account already uses this email. Try logging in instead." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normEmail, passwordHash },
  });

  setSessionCookie(signToken(user.id));
  return NextResponse.json({ user: publicUser(user) });
}
