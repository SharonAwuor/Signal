import { getCurrentUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

export default async function Page() {
  const user = await getCurrentUser();
  const recentReports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const reportCount = await prisma.report.count();

  return (
    <HomeClient
      initialUser={user ? publicUser(user) : null}
      recentReports={recentReports.map((r) => ({
        id: r.id,
        type: r.type,
        valueRaw: r.valueRaw,
        category: r.category,
        date: r.createdAt.toISOString(),
      }))}
      reportCount={reportCount}
    />
  );
}
