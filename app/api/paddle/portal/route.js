// app/api/paddle/portal/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Subscription from "@/models/Subscription";
import Site from "@/models/Site";
import { getPaddle } from "@/lib/paddleSdk";

/**
 * Portail client Paddle en self-service.
 *
 * Sécurité :
 *   - L'utilisateur est authentifié D'ABORD (session Auth.js serveur).
 *   - L'ID customer Paddle n'est JAMAIS lu depuis le client : il est
 *     résolu côté serveur via la session (email du compte), d'abord dans
 *     la collection `customers`, puis en secours sur le Site du compte
 *     (paddleCustomerId) pour les comptes créés avant le miroir.
 *   - Les abonnements à précharger sont lus dans `subscriptions`, toujours
 *     côté serveur.
 *
 * Le flux :
 *   POST /api/paddle/portal -> mint d'une session de portail -> redirect
 *   303 vers l'URL authentifiée renvoyée par Paddle (Paddle héberge le
 *   portail : moyen de paiement, annulation, factures).
 */
export async function POST(request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  await dbConnect();

  // --- 1. Résolution serveur de l'ID customer Paddle ---
  const email = String(session.user.email).toLowerCase();

  let customer = await Customer.findOne({ email }).lean();

  if (!customer) {
    const site = await Site.findOne({ userId: session.user.id }).lean();
    if (site?.paddleCustomerId) {
      customer = await Customer.findById(site.paddleCustomerId).lean();
    }
  }

  if (!customer) {
    return NextResponse.json(
      { error: "Aucun customer Paddle associé à ce compte." },
      { status: 404 }
    );
  }

  // --- 2. Abonnements du customer (coffre des liens d'annulation) ---
  const subscriptions = await Subscription.find({ customerId: customer._id })
    .select("_id")
    .lean();
  const subscriptionIds = subscriptions.map((sub) => sub._id);

  // --- 3. Mint de la session de portail ---
  let portalSession;
  try {
    portalSession = await getPaddle().customerPortalSessions.create(
      customer._id,
      subscriptionIds
    );
  } catch (err) {
    console.error("Erreur création session portail Paddle :", err);
    return NextResponse.json(
      { error: "Impossible d'ouvrir le portail Paddle." },
      { status: 502 }
    );
  }

  const portalUrl = portalSession?.urls?.general?.overview;
  if (!portalUrl) {
    return NextResponse.json(
      { error: "Réponse Paddle invalide (URL de portail absente)." },
      { status: 502 }
    );
  }

  // 303 : le navigateur redirige vers le portail hébergé par Paddle.
  return NextResponse.redirect(portalUrl, 303);
}