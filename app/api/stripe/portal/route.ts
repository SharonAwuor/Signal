import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account on file." }, { status: 400 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe billing portal failed:", err.message);
    return NextResponse.json({ error: "Couldn't open the billing portal — check your Stripe keys in .env." }, { status: 500 });
  }
}
