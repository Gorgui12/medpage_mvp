// app/api/stripe/webhook/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Signature Stripe invalide :", err.message);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  await dbConnect();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const subdomain = session.metadata?.subdomain;
      if (subdomain) {
        await Site.findOneAndUpdate(
          { subdomain },
          {
            isPublished: true,
            stripeSubscriptionId: session.subscription,
            stripeSubscriptionStatus: "active",
          }
        );
        console.log("Site active (paiement) :", subdomain);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await Site.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { isPublished: true, stripeSubscriptionStatus: "active" }
        );
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await Site.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { stripeSubscriptionStatus: "past_due" }
        );
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await Site.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        { isPublished: false, stripeSubscriptionStatus: "canceled" }
      );
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
