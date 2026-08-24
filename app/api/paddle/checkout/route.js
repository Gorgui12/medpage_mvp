// app/api/paddle/checkout/route.js
import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/getOwnedSite";
import { paddleRequest } from "@/lib/paddle";
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
    if (site.isPublished && site.paddleSubscriptionStatus === "active") {
      return NextResponse.json({ error: "Ce site est déjà actif." }, { status: 400 });
    }

    const body = await request.json();
    const promoCode = body?.promoCode || null;

    // --- Création ou réutilisation du customer Paddle ---
    let customerId = site.paddleCustomerId;
    if (!customerId) {
      await dbConnect();
      
      const customerData = await paddleRequest("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: site.cabinetName,
          email: authSession.user.email,
          custom_data: { subdomain: site.subdomain },
        }),
      });
      
      customerId = customerData.id;
      
      // Mise à jour du site avec le customerId Paddle
      await Site.updateOne(
        { _id: site._id },
        { paddleCustomerId: customerId }
      );
    }

    // --- Création d'un price ID et checkout session Paddle ---
    const priceId = process.env.PADDLE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Configuration Paddle manquante." }, { status: 500 });
    }

    // Avec Paddle, le checkout est géré côté client via le SDK
    // Cette API ne sert qu'à retourner les informations nécessaires
    return NextResponse.json({
      success: true,
      priceId,
      customerId,
      message: "Informations récupérées avec succès"
    }, { status: 200 });

  } catch (err) {
    console.error("Erreur création checkout Paddle :", err);
    return NextResponse.json(
      { error: "Impossible de préparer le paiement." },
      { status: 500 }
    );
  }
}
