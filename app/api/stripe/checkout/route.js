// app/api/stripe/checkout/route.js
import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/getOwnedSite";
import { stripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "medpage.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || `https://app.${ROOT_DOMAIN}`;

export async function POST(request) {
  try {
    const { session: authSession, site } = await getOwnedSite();

    if (!authSession) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    }
    if (!site) {
      return NextResponse.json({ error: "Aucun site associé à ce compte." }, { status: 404 });
    }
    if (site.isPublished && site.stripeSubscriptionStatus === "active") {
      return NextResponse.json({ error: "Ce site est déjà actif." }, { status: 400 });
    }

    // Code promo optionnel passé depuis le bouton d'activation
    let promotionCodeId = null;
    try {
      const body = await request.json();
      if (body?.promoCode) {
        // On cherche le Promotion Code Stripe correspondant (doit exister dans ton dashboard Stripe)
        const codes = await stripe.promotionCodes.list({ code: body.promoCode, limit: 1, active: true });
        if (codes.data.length > 0) {
          promotionCodeId = codes.data[0].id;
        }
      }
    } catch {
      // Body vide ou pas de code : on continue sans promo
    }

    // --- Création ou réutilisation du customer Stripe ---
    let customerId = site.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: site.cabinetName,
        email: authSession.user.email,
        metadata: { subdomain: site.subdomain },
      });
      customerId = customer.id;
      
      // Mise à jour directe du site avec le customerId (site est un objet plain, pas un document Mongoose)
      await dbConnect();
      await Site.updateOne(
        { _id: site._id },
        { stripeCustomerId: customerId }
      );
    }

    // --- Session de paiement ---
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      // allow_promotion_codes : Stripe affiche automatiquement un champ code promo.
      // Si on a pré-validé un code, on le pré-applique via discounts.
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : { allow_promotion_codes: true }),
      success_url: `${APP_URL}/dashboard?payment=success`,
      cancel_url: `${APP_URL}/dashboard/abonnement`,
      metadata: { subdomain: site.subdomain },
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url }, { status: 200 });
  } catch (err) {
    console.error("Erreur création session Stripe :", err);
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement." },
      { status: 500 }
    );
  }
}
