import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function normalize(v: string, type: string) {
  if (type === "phone") return v.replace(/[^\d]/g, "");
  return v.trim().toLowerCase();
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const demo = await prisma.user.upsert({
    where: { email: "demo@signal.app" },
    update: {},
    create: {
      name: "Demo Reporter",
      email: "demo@signal.app",
      passwordHash,
      premium: true,
    },
  });

  const reports: { type: string; valueRaw: string; category: string; description: string }[] = [
    { type: "phone", valueRaw: "+254712345678", category: "Fake M-Pesa agent", description: "Called claiming to reverse a wrong deposit, asked for PIN." },
    { type: "phone", valueRaw: "+254712345678", category: "Impersonation", description: "Claimed to be from the bank fraud department." },
    { type: "phone", valueRaw: "+254712345678", category: "Fake M-Pesa agent", description: "Sent a fake confirmation SMS then asked to 'send back'." },
    { type: "business", valueRaw: "Quickloan Direct Kenya", category: "Fake loan / upfront fee", description: "Asked for a 'processing fee' before releasing any loan." },
    { type: "social", valueRaw: "@forex_wins_ke", category: "Investment scam", description: "Promised guaranteed daily returns, blocked after payment." },
    { type: "name", valueRaw: "Daniel Mworia", category: "Romance scam", description: "Built a relationship over months then asked for emergency cash." },
  ];

  for (const r of reports) {
    await prisma.report.create({
      data: {
        type: r.type,
        valueRaw: r.valueRaw,
        valueNorm: normalize(r.valueRaw, r.type),
        category: r.category,
        description: r.description,
        reporterId: demo.id,
      },
    });
  }

  console.log("Seeded database. Demo login: demo@signal.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
