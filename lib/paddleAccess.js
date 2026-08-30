// lib/paddleAccess.js

/**
 * Politique d'accès PAYANT de MedPage, calculée sur la copie locale d'un
 * abonnement Paddle (modèle Subscription, alimenté par les webhooks).
 *
 * Règles :
 *   - `active` et `trialing` accordent l'accès.
 *   - `past_due` : période de grâce — on CONSERVE l'accès pendant que
 *     Paddle retente le paiement (révoquer immédiatement punirait une
 *     panne de carte passagère).
 *   - `paused` et `canceled` : accès révoqué (la collecte a réellement
 *     cessé / l'abonnement est définitivement terminé).
 *   - Un `scheduled_change` (cancel/pause à venir) ne révoque JAMAIS
 *     l'accès : seul le `status` réel compte. On l'ignore donc ici.
 *
 * Ce helper ne fait aucun appel réseau : il est synchronisé et sûr à
 * utiliser aussi bien dans le webhook que dans les pages SSR.
 */

const ACCESS_GRANTING_STATUSES = new Set(["active", "trialing"]);

export function subscriptionGrantsAccess(subscription, { pastDueGrace = true } = {}) {
  if (!subscription) return false;

  if (ACCESS_GRANTING_STATUSES.has(subscription.status)) {
    return true;
  }

  return pastDueGrace && subscription.status === "past_due";
}

/**
 * Statut interne lisible (pour l'UI / les métriques).
 */
export function paidAccessLabel(subscription) {
  if (!subscription) return "none";
  if (subscriptionGrantsAccess(subscription)) return "granted";
  return subscription.status || "none";
}