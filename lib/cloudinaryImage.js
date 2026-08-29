// lib/cloudinaryImage.js
//
// Petit utilitaire pour servir les images Cloudinary plus intelligemment :
// on injecte automatiquement les transformations f_auto (meilleur format :
// WebP/AVIF) et q_auto (qualité optimale) dans les URLs d'origine, ce qui
// réduit le poids des images et améliore les Core Web Vitals sans changer
// le contenu de la base de données.
//
// Conçu pour les URLs standard de type :
//   https://res.cloudinary.com/<cloud>/image/upload/v1234/foo.jpg
// On retire aussi le suffixe de version /v1234 pour profiter du cache.

const TRANSFORM = "f_auto,q_auto";

/**
 * Retourne une URL Cloudinary optimisée (f_auto,q_auto).
 * Si l'URL n'est pas hostée sur Cloudinary ou contient déjà une
 * transformation, on la renvoie telle quelle.
 */
export function cloudinaryOptimized(url) {
  if (!url) return url;

  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("res.cloudinary.com")) return url;

    // L'URL contient déjà des transformations optimisées ?
    if (/image\/upload\/[^/]*f_auto[^/]*\//.test(u.pathname)) return url;

    // Format : /<cloud>/image/upload/<...>
    const marker = "/image/upload/";
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return url;

    const after = u.pathname.slice(idx + marker.length);
    // Retire le préfixe de version (ex: /v1234567890/index.xml ou /v123/foo.jpg)
    const versionless = after.replace(/^v\d+\//, "");

    u.pathname = marker + TRANSFORM + "/" + versionless;
    return u.toString();
  } catch {
    return url;
  }
}
