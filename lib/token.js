// lib/token.js
import crypto from "crypto";

/**
 * Génère un token aléatoire cryptographiquement sûr.
 * Utilisé comme "clé secrète" propre à chaque site, remise au médecin
 * une seule fois à la création (comme un mot de passe à usage unique).
 */
export function generateEditToken() {
  return crypto.randomBytes(24).toString("hex"); // ex: 48 caractères hexadécimaux
}
