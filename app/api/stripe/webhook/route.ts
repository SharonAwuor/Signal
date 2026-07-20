import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

// Stripe needs the raw request body to verify the signature — don't parse it as JSON first.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { premium: true, stripeSubscriptionId: session.subscription as string },
      });
      break;
    }
    // Keeps premium status in sync if a renewal fails, a card expires, or the user cancels.
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const active = subscription.status === "active" || subscription.status === "trialing";
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: { premium: active },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
