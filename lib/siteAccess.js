// lib/siteAccess.js

/**
 * Détermine si un site doit être servi publiquement.
 * Un site est accessible si :
 *   1. Son abonnement Stripe est actif (isPublished = true), OU
 *   2. Son trial est encore en cours ET n'a pas été révoqué.
 *
 * Centralisé ici pour être utilisé à la fois dans :
 *   - la landing page SSR (app/sites/[subdomain]/page.js)
 *   - le dashboard (bandeau "X jours restants")
 *   - le webhook Stripe (gérer expiration)
 */
export function isSiteAccessible(site) {
  if (!site) return false;

  // Abonnement payant actif → toujours accessible
  if (site.isPublished && site.stripeSubscriptionStatus === "active") {
    return true;
  }

  // Trial révoqué → jamais accessible
  if (site.trialRevoked) return false;

  // Trial encore en cours → accessible
  if (site.trialEndsAt && new Date() < new Date(site.trialEndsAt)) {
    return true;
  }

  return false;
}

/**
 * Calcule le nombre de jours restants dans le trial.
 * Retourne 0 si le trial est expiré ou si le site est en abonnement payant.
 */
export function trialDaysRemaining(site) {
  if (!site?.trialEndsAt) return 0;
  if (site.isPublished) return 0;

  const diff = new Date(site.trialEndsAt) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Retourne le statut lisible du site pour l'UI.
 */
export function getSiteStatus(site) {
  if (!site) return "inactive";
  if (site.isPublished && site.stripeSubscriptionStatus === "active") return "active";
  if (site.trialRevoked) return "revoked";
  if (site.trialEndsAt && new Date() < new Date(site.trialEndsAt)) return "trial";
  return "expired";
}
