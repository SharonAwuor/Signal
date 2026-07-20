import { redirect } from "next/navigation";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [reports, searches] = await Promise.all([
    prisma.report.findMany({ where: { reporterId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.search.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <DashboardClient
      user={publicUser(user)}
      reports={reports.map((r) => ({ ...r, date: r.createdAt.toISOString() }))}
      searches={searches.map((s) => ({ ...s, date: s.createdAt.toISOString() }))}
    />
  );
}
