// lib/paddleSync.js

import { EventName } from "@paddle/paddle-node-sdk";
import { dbConnect } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Subscription from "@/models/Subscription";
import Site from "@/models/Site";
import { subscriptionGrantsAccess } from "@/lib/paddleAccess";

/**
 * Couche de synchronisation ("mirror") entre les webhooks Paddle et notre
 * base de données.
 *
 * Tout est IDEMPOTENT : chaque écriture est un upsert pivoté sur l'ID
 * Paddle (`_id`), jamais une insertion aveugle. Paddle livre ses events
 * au moins-une-fois et potentiellement hors ordre ; rejouer le même event
 * ne doit donc rien dupliquer ni corrompre.
 */

/**
 * Miroir d'un customer (customer.created / customer.updated).
 */
export async function syncCustomer(data) {
  if (!data?.id || !data?.email) return;

  await Customer.updateOne(
    { _id: data.id },
    {
      $set: {
        email: String(data.email).toLowerCase(),
        name: data.name || "",
      },
    },
    { upsert: true }
  );

  // Si le customer a été créé depuis un checkout MedPage, on recale l'ID
  // sur le Site correspondant (custom_data.subdomain est posé au checkout).
  const subdomain = data.customData?.subdomain;
  if (subdomain) {
    await Site.updateOne(
      { subdomain: String(subdomain).toLowerCase() },
      { $set: { paddleCustomerId: data.id } }
    );
  }
}

/**
 * Miroir d'un abonnement (subscription.*) puis recalcul de l'accès du Site.
 * Le site est retrouvé par son abonnement, en secours par son customer
 * (1 compte = 1 customer = 1 site dans ce MVP).
 */
export async function syncSubscription(data) {
  if (!data?.id) return;

  const item = data.items?.[0] || {};
  const scheduled = data.scheduledChange || null;

  await Subscription.updateOne(
    { _id: data.id },
    {
      $set: {
        customerId: data.customerId,
        status: data.status,
        priceId: item.price?.id || null,
        productId: item.price?.productId || item.product?.id || null,
        scheduledChangeAction: scheduled?.action || null,
        scheduledChangeAt: scheduled?.effectiveAt
          ? new Date(scheduled.effectiveAt)
          : null,
      },
    },
    { upsert: true }
  );

  await mirrorSubscriptionToSite(data);
}

/**
 * Applique le statut de l'abonnement sur le Site MedPage :
 *   - paddleSubscriptionStatus (trialing -> active, comme avant)
 *   - paddleSubscriptionId / paddleCustomerId
 *   - isPublished = subscriptionGrantsAccess(...) : trialing/active (et
 *     past_due en grâce) publient, canceled/paused retirent. Un simple
 *     scheduled_change ne bascule jamais le site.
 */
export async function mirrorSubscriptionToSite(data) {
  const subId = data.id;
  const customerId = data.customerId;
  const internalStatus = data.status === "trialing" ? "active" : data.status;

  if (!["active", "past_due", "paused", "canceled"].includes(internalStatus)) {
    return;
  }

  const query = customerId
    ? { $or: [{ paddleSubscriptionId: subId }, { paddleCustomerId: customerId }] }
    : { paddleSubscriptionId: subId };

  const set = {
    paddleSubscriptionId: subId,
    paddleSubscriptionStatus: internalStatus,
    isPublished: subscriptionGrantsAccess({ status: data.status }),
  };
  if (customerId) set.paddleCustomerId = customerId;

  await Site.updateMany(query, { $set: set });
}

/**
 * Fulfillment d'un paiement terminé (transaction.completed) :
 *   - publie le Site (isPublished = true) retrouvé via custom_data
 *     (siteId / subdomain) ou via l'abonnement/customer,
 *   - amorce le miroir de l'abonnement si la transaction en référence un
 *     (rangé "active" : un paiement est passé).
 */
export async function handleTransactionCompleted(data) {
  const subId = data.subscriptionId || null;
  const customerId = data.customerId || null;
  const customData = data.customData || {};

  // --- 1. Provisioning : publication du site ---
  const siteQuery = [];
  if (customData.siteId) siteQuery.push({ _id: customData.siteId });
  if (customData.subdomain) siteQuery.push({ subdomain: String(customData.subdomain).toLowerCase() });
  if (subId) siteQuery.push({ paddleSubscriptionId: subId });
  if (customerId) siteQuery.push({ paddleCustomerId: customerId });

  if (siteQuery.length) {
    const set = {
      isPublished: true,
      paddleSubscriptionStatus: "active",
      paddleSubscriptionId: subId,
    };
    if (customerId) set.paddleCustomerId = customerId;

    await Site.updateMany({ $or: siteQuery }, { $set: set });
  }

  // --- 2. Miroir de l'abonnement (si la transaction en a créé un) ---
  if (subId && customerId) {
    const item = data.items?.[0] || {};
    await Subscription.updateOne(
      { _id: subId },
      {
        $set: {
          customerId,
          status: "active",
          priceId: item.price?.id || null,
          productId: item.price?.productId || item.product?.id || null,
        },
      },
      { upsert: true }
    );

    // Le customer référence aussi un site : on garde le lien à jour.
    await Site.updateMany(
      { paddleSubscriptionId: subId },
      { $set: { paddleCustomerId: customerId } }
    );
  }
}

/**
 * Dispatch des events vérifiés vers les handlers typés.
 * Les typologies non prises en charge sont ignorées proprement (l'ack 2xx
 * est légitime : Paddle ne doit pas relivrer indéfiniment des events que
 * l'on ne souhaite pas traiter).
 */
export async function dispatchEvent(event) {
  await dbConnect();

  switch (event.eventType) {
    // --- Abonnements : miroir + recalcul d'accès du site ---
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionTrialing:
    case EventName.SubscriptionActivated:
    case EventName.SubscriptionPastDue:
    case EventName.SubscriptionPaused:
    case EventName.SubscriptionResumed:
      await syncSubscription(event.data);
      break;

    // --- Customers : miroir ---
    case EventName.CustomerCreated:
    case EventName.CustomerUpdated:
      await syncCustomer(event.data);
      break;

    // --- Paiement terminé : fulfilment (publication) + miroir ---
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data);
      break;

    default:
      break;
  }
}