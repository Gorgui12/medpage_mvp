// app/api/paddle/webhook/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";

/**
 * Webhook Paddle Billing.
 *
 * Sécurité : chaque requête est signée par Paddle via le header
 * `Paddle-Signature: ts=<timestamp>;h1=<hmac_sha256_hex>`.
 * On recalcule HMAC-SHA256("<ts>:<body>", PADDLE_WEBHOOK_SECRET) et on
 * compare en temps constant. Une requête sans signature valide est rejetée
 * (400) — jamais de traitement basé sur un body non authentifié.
 */

function verifyPaddleSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  const parts = {};
  for (const piece of signatureHeader.split(";")) {
    const [key, value] = piece.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }
  const { ts, h1 } = parts;
  if (!ts || !h1) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(h1, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Statut de subscription Paddle -> statut interne du Site.
 */
function mapSubscriptionStatus(paddleStatus) {
  switch (paddleStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "paused":
      return "paused";
    default:
      return null;
  }
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (
    !verifyPaddleSignature(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET)
  ) {
    console.error("Signature Paddle invalide ou absente.");
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  await dbConnect();

  // Le payload réel de Paddle est en snake_case ("event_type") ; on garde
  // un fallback camelCase par robustesse.
  const type = event.event_type || event.eventType;
  const data = event.data || {};

  switch (type) {
    // --- Paiement ponctuel du checkout terminé : on active le site ---
    case "transaction.completed": {
      const subdomain = data?.custom_data?.subdomain;
      if (subdomain) {
        await Site.findOneAndUpdate(
          { subdomain: String(subdomain).toLowerCase() },
          {
            isPublished: true,
            paddleSubscriptionId: data.subscription_id || null,
            paddleSubscriptionStatus: "active",
          }
        );
        console.log("Site activé (paiement Paddle) :", subdomain);
      }
      break;
    }

    case "subscription.activated":
    case "subscription.resumed":
    case "subscription.updated": {
      const status = mapSubscriptionStatus(data.status);
      if (!status) break;

      const update = { paddleSubscriptionStatus: status };
      if (status === "active") update.isPublished = true;

      // Le site peut être retrouvé par l'id d'abonnement ; en secours par
      // le customer (1 compte = 1 customer = 1 site dans ce MVP), au cas où
      // l'événement arrive avant qu'on ait stocké l'abonnement.
      const query = data.customer_id
        ? {
            $or: [
              { paddleSubscriptionId: data.id },
              { paddleCustomerId: data.customer_id },
            ],
          }
        : { paddleSubscriptionId: data.id };

      await Site.findOneAndUpdate(query, update);
      break;
    }

    case "subscription.past_due": {
      const query = data.customer_id
        ? {
            $or: [
              { paddleSubscriptionId: data.id },
              { paddleCustomerId: data.customer_id },
            ],
          }
        : { paddleSubscriptionId: data.id };
      await Site.findOneAndUpdate(query, { paddleSubscriptionStatus: "past_due" });
      break;
    }

    case "subscription.canceled": {
      const query = data.customer_id
        ? {
            $or: [
              { paddleSubscriptionId: data.id },
              { paddleCustomerId: data.customer_id },
            ],
          }
        : { paddleSubscriptionId: data.id };
      await Site.findOneAndUpdate(query, {
        isPublished: false,
        paddleSubscriptionStatus: "canceled",
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
