import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  if (user.premium) return NextResponse.json({ error: "Already premium." }, { status: 400 });

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "Stripe isn't configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID to .env." },
      { status: 500 }
    );
  }

  try {
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=1`,
      cancel_url: `${appUrl}/dashboard`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // Most common cause here: STRIPE_SECRET_KEY / STRIPE_PRICE_ID in .env are
    // still the placeholder values from .env.example, not real Stripe keys.
    console.error("Stripe checkout failed:", err.message);
    return NextResponse.json(
      { error: "Stripe rejected the request — check that STRIPE_SECRET_KEY and STRIPE_PRICE_ID in .env are real values from your Stripe dashboard, not placeholders." },
      { status: 500 }
    );
  }
}
