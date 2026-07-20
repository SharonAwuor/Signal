import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const [reports, searches] = await Promise.all([
    prisma.report.findMany({ where: { reporterId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.search.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return NextResponse.json({ reports, searches });
}
