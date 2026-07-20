import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, initials } from "@/lib/auth";
import { normalize, EntryType } from "@/lib/match";

const VALID_TYPES: EntryType[] = ["phone", "business", "name", "social"];
const VALID_CATEGORIES = [
  "Fake M-Pesa agent",
  "Impersonation",
  "Fake loan / upfront fee",
  "Investment scam",
  "Romance scam",
  "Phishing link",
  "Fake job offer",
  "Delivery / parcel scam",
  "Other",
];

export async function GET() {
  const user = await getCurrentUser();
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { reporter: { select: { name: true } } },
  });

  const shaped = reports.map((r) => ({
    id: r.id,
    type: r.type,
    valueRaw: r.valueRaw,
    category: r.category,
    date: r.createdAt,
    // Full description is a premium perk; everyone sees the headline.
    description: user?.premium ? r.description : null,
    reporter: user?.premium ? initials(r.reporter.name) : null,
  }));

  return NextResponse.json({ reports: shaped });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in to submit a report." }, { status: 401 });
  }

  const { type, value, category, description } = await req.json();

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid entry type." }, { status: 400 });
  }
  if (!value?.trim() || !description?.trim()) {
    return NextResponse.json(
      { error: "Add the contact and a short description before submitting." },
      { status: 400 }
    );
  }
  const cat = VALID_CATEGORIES.includes(category) ? category : "Other";

  const report = await prisma.report.create({
    data: {
      type,
      valueRaw: value.trim(),
      valueNorm: normalize(value, type),
      category: cat,
      description: description.trim(),
      reporterId: user.id,
    },
  });

  return NextResponse.json({ report });
}
