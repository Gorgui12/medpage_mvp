// app/api/paddle/checkout/route.js
import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/getOwnedSite";
import { paddleRequest } from "@/lib/paddle";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";

/**
 * Calcule l'URL de base de l'app à partir de la requête entrante.
 * On privilégie NEXT_PUBLIC_APP_URL si défini, sinon on dérive le schéma +
 * host du header Host de la requête. Cela garantit que le success_url de
 * Paddle pointe toujours vers le vrai domaine visité (jamais localhost en
 * production), même si l'environnement de prod n'a pas la variable.
 */
function resolveAppUrl(request) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }

  const host = request.headers.get("host");
  if (host && !host.includes("localhost")) {
    // En production derrière un proxy/load balancer, on suppose HTTPS.
    const proto = request.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

/**
 * Prépare le paiement Paddle pour le site du médecin connecté.
 *
 * Flow (100 % serveur, pas de SDK client requis) :
 *   1. Création/réutilisation du customer Paddle (email du compte).
 *   2. Création d'une transaction avec le price configuré.
 *   3. On renvoie l'URL du checkout hébergé Paddle ; le client y redirige.
 *
 * Après paiement, Paddle appelle /api/paddle/webhook (transaction.completed)
 * qui active le site. Le success_url ramène sur /dashboard?payment=success
 * pour afficher la bannière de confirmation.
 */
export async function POST(request) {
  try {
    const APP_URL = resolveAppUrl(request);
    const { session: authSession, site } = await getOwnedSite();

    if (!authSession) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    }
    if (!site) {
      return NextResponse.json(
        { error: "Aucun site associé à ce compte." },
        { status: 404 }
      );
    }
    if (site.isPublished && site.paddleSubscriptionStatus === "active") {
      return NextResponse.json({ error: "Ce site est déjà actif." }, { status: 400 });
    }

    const priceId = process.env.PADDLE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Configuration Paddle manquante." },
        { status: 500 }
      );
    }

    await dbConnect();

    // --- Création ou réutilisation du customer Paddle ---
    let customerId = site.paddleCustomerId;
    if (!customerId) {
      const customerData = await paddleRequest("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: site.cabinetName,
          email: authSession.user.email,
          custom_data: { subdomain: site.subdomain },
        }),
      });

      customerId = customerData.id;

      await Site.updateOne({ _id: site._id }, { paddleCustomerId: customerId });
    }

    // --- Création de la transaction -> URL du checkout hébergé ---
    const transaction = await paddleRequest("/transactions", {
      method: "POST",
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer_id: customerId,
        custom_data: {
          siteId: site._id.toString(),
          subdomain: site.subdomain,
        },
        checkout: {
          settings: {
            success_url: `${APP_URL}/dashboard?payment=success`,
          },
        },
      }),
    });

    const checkoutUrl = transaction?.checkout?.url;
    if (!checkoutUrl) {
      throw new Error("Transaction créée sans URL de checkout.");
    }

    return NextResponse.json({ checkoutUrl }, { status: 200 });
  } catch (err) {
    console.error("Erreur création checkout Paddle :", err);
    return NextResponse.json(
      { error: "Impossible de préparer le paiement." },
      { status: 500 }
    );
  }
}
