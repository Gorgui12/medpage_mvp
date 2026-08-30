// app/api/paddle/webhook/route.js
import { NextResponse } from "next/server";
import { getPaddle } from "@/lib/paddleSdk";
import { dispatchEvent } from "@/lib/paddleSync";

/**
 * Webhook Paddle Billing — fulfillment & provisioning.
 *
 * Sécurité (dans l'ordre) :
 *   1. Le BODY COMPLET n'est JAMAIS parsé en JSON avant vérification : on
 *      le lit en texte (`await request.text()`) et c'est ce texte brut que
 *      `paddle.webhooks.unmarshal(rawBody, secret, signature)` vérifie.
 *      Un body pré-parsé (indentations/doublons de clés) échouerait.
 *   2. La vérification utilise l'SDK officiel avec le SECRET DE SIGNATURE
 *      du webhook ("signing key" de la notification destination), PAS la
 *      clé API : elles sont différentes et non interchangeables.
 *   3. Si la signature est invalide -> réponse non-2xx : Paddle considère
 *      la livraison comme échouée et réessaiera. On ne compare jamais en
 *      aveugle un event non authentifié.
 *
 * Les secrets vérifiés peuvent être pluraux (PADDLE_WEBHOOK_SECRET puis,
 * optionnel, PADDLE_WEBHOOK_SECRET_2) : pendant une rotation ou si
 * d'anciennes destinations restent actives, les deux continuent d'être
 * acceptés sans causer de retries inutiles.
 *
 * Livraisons : au moins-une-fois et hors ordre possible. Les handlers
 * (lib/paddleSync.js) font tous des upserts idempotents pivotés sur l'ID
 * Paddle, jamais des insertions aveugles.
 */
async function verifyAndUnmarshal(paddle, rawBody, signature) {
  const secrets = [
    process.env.PADDLE_WEBHOOK_SECRET,
    process.env.PADDLE_WEBHOOK_SECRET_2,
  ].filter(Boolean);

  if (secrets.length === 0) {
    console.error("PADDLE_WEBHOOK_SECRET non configuré.");
    return { error: "invalid" };
  }

  const errors = [];

  for (const secret of secrets) {
    try {
      return { event: await paddle.webhooks.unmarshal(rawBody, secret, signature) };
    } catch (err) {
      // Signature invalide pour ce secret : on essaie le suivant.
      errors.push(err);
    }
  }

  // Aucun secret n'a vérifié la requête. On distingue deux cas :
  //  - toutes les erreurs sont des échecs de SIGNATURE -> requête
  //    définitivement inauthentique (400, Paddle ne réessaiera pas) ;
  //  - au moins une erreur est un échec de PARSING du payload (mal formé,
  //    incomplet) -> erreur transitoire de notre côté (500, Paddle relivrera).
  const allSignatureFailures = errors.every((err) =>
    String(err?.message).includes("signature verification failed")
  );

  return allSignatureFailures ? { error: "invalid" } : { error: "internal" };
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (!rawBody || !signature) {
    return NextResponse.json(
      { error: "Body ou signature manquants." },
      { status: 400 }
    );
  }

  // --- Vérification AVANT toute autre chose ---
  const result = await verifyAndUnmarshal(getPaddle(), rawBody, signature);
  if (!result.event) {
    if (result.error === "invalid") {
      console.error("Webhook Paddle rejeté : signature invalide.");
      return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
    }
    console.error("Webhook Paddle rejeté : payload illisible.", result.error);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
  const event = result.event;

  // --- Routage vers les handlers typés (idempotents) ---
  try {
    await dispatchEvent(event);
  } catch (err) {
    // Erreur interne (ex: DB indisponible) : non-2xx pour laisser Paddle
    // relivrer ; les handlers étant idempotents, la relivraison est sûre.
    console.error("Erreur traitement webhook Paddle :", err);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}