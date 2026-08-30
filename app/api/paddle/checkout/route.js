// app/api/paddle/checkout/route.js
import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/getOwnedSite";
import { paddleRequest } from "@/lib/paddle";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";

/**
 * Calcule l'URL de base de l'app à partir de la requête entrante.
 *
 * Règle : en production (host de la requête = un vrai domaine), on utilise
 * TOUJOURS le domaine de la requête et on IGNORE une variable d'env locale
 * (localhost) — une NEXT_PUBLIC_APP_URL oubliée en dev ne doit jamais faire
 * atterrir le client sur localhost après paiement.
 */
function resolveAppUrl(request) {
  const host = request.headers.get("host") || "";
  const isLocalHost = host.includes("localhost") || host === "localhost";
  const requestUrl =
    !isLocalHost && host
      ? `${request.headers.get("x-forwarded-proto") || "https"}://${host}`
      : null;

  // Un vrai domaine dans la requête prime toujours.
  if (requestUrl) {
    return requestUrl.replace(/\/+$/, "");
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
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
 * qui active le site. Paddle renvoie alors l'utilisateur vers success_url
 * (configuré dans Paddle.Initialize, côté client). Le checkout.url de la
 * transaction est le "payment link" : une URL de l'app (même domaine) qui
 * charge Paddle.js ; Paddle.js détecte le paramètre ?_ptxn= et ouvre le
 * checkout en overlay automatiquement.
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

    // --- Création de la transaction -> payment link (checkout sur l'app) ---
    // Paddle compose checkout.url = <URL passée> + "?_ptxn=<txn_id>". La
    // page visée charge Paddle.js qui ouvre le checkout en overlay. La clé
    // "settings.success_url" n'existe pas côté API : le succès est piloté
    // par settings.successUrl de Paddle.Initialize (client).
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
          url: APP_URL,
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
