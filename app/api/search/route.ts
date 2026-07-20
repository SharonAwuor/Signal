import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, initials } from "@/lib/auth";
import { detectType, normalize, phoneMatch, fuzzyTextSearch } from "@/lib/match";

type Tier = "guest" | "free" | "premium";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query?.trim()) {
    return NextResponse.json({ error: "Enter something to check." }, { status: 400 });
  }

  const user = await getCurrentUser();
  const tier: Tier = !user ? "guest" : user.premium ? "premium" : "free";

  const type = detectType(query);
  const norm = normalize(query, type);

  // "business" vs "name" can't be told apart from the raw text alone, so a
  // text query searches both — otherwise a report saved as "business" would
  // never surface when someone searches that same text (it auto-detects as "name").
  const searchTypes = type === "phone" ? ["phone"] : type === "social" ? ["social"] : ["name", "business"];

  const candidates = await prisma.report.findMany({
    where: { type: { in: searchTypes } },
    include: { reporter: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const exact: typeof candidates = [];
  const fuzzy: { item: (typeof candidates)[number]; score: number }[] = [];

  if (type === "phone") {
    for (const c of candidates) {
      const { exact: isExact, score } = phoneMatch(query, c.valueRaw);
      if (isExact) exact.push(c);
      else if (score > 0.72) fuzzy.push({ item: c, score });
    }
  } else {
    const exactMatches = candidates.filter((c) => c.valueNorm === norm);
    exact.push(...exactMatches);
    const rest = candidates.filter((c) => c.valueNorm !== norm);
    fuzzy.push(...fuzzyTextSearch(query, rest, ["valueRaw"]).filter((r) => r.score > 0.55));
  }

  const risk = exact.length >= 3 ? "danger" : exact.length >= 1 ? "caution" : fuzzy.length > 0 ? "caution" : "clear";

  // Log the search to the user's history (guests aren't tracked).
  if (user) {
    await prisma.search.create({ data: { userId: user.id, query, type, risk } });
  }

  const shape = (r: (typeof candidates)[number]) => {
    if (tier === "premium") {
      return {
        id: r.id,
        category: r.category,
        description: r.description,
        date: r.createdAt,
        reporter: initials(r.reporter.name),
      };
    }
    if (tier === "free") {
      return { id: r.id, category: r.category, date: r.createdAt };
    }
    return null;
  };

  return NextResponse.json({
    query,
    type,
    risk,
    tier,
    exactCount: exact.length,
    fuzzyCount: fuzzy.length,
    exactMatches: tier === "guest" ? [] : exact.map(shape),
    fuzzyMatches:
      tier === "guest"
        ? []
        : fuzzy
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((f) => ({ ...shape(f.item), similarity: Math.round(f.score * 100) })),
  });
}
