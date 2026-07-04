// middleware.ts
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * On instancie ICI une version "légère" d'Auth.js (sans provider Credentials
 * ni import Mongoose), dédiée au middleware qui tourne en Edge Runtime.
 * Voir auth.config.js pour le détail de cette séparation.
 */
const { auth } = NextAuth(authConfig);

/**
 * Domaine racine de la plateforme (sans le sous-domaine, SANS le port).
 * En prod : "medpage.com". En local : "localhost".
 * On force le retrait du port ici pour éviter les bugs de comparaison
 * entre "localhost:3000" (avec port) et "lavdn.localhost:3000" (host réel).
 */
const RAW_ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
const ROOT_DOMAIN = RAW_ROOT_DOMAIN.replace(/:\d+$/, ""); // "localhost:3000" -> "localhost"

// Sous-domaines réservés qui doivent toujours pointer vers l'app principale
const RESERVED_SUBDOMAINS = ["app", "www", "api", "admin"];

export default auth((request) => {
  const host = (request.headers.get("host") || "").replace(/:\d+$/, ""); // on retire le port du host aussi
  const { pathname } = request.nextUrl;

  // --- Extraction du sous-domaine ---
  // Si host = "lavdn.localhost" et ROOT_DOMAIN = "localhost" -> subdomain = "lavdn"
  // Si host = "localhost" (pas de sous-domaine) -> subdomain = null
  let subdomain = null;
  if (host !== ROOT_DOMAIN && host.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = host.slice(0, -(ROOT_DOMAIN.length + 1)); // retire ".ROOT_DOMAIN" à la fin
  }

  // --- Cas 1 : sous-domaine client détecté -> rewrite vers /sites/[subdomain] ---
  // (priorité sur la vérification d'auth : un site public n'a jamais besoin
  // de session, donc on traite ce cas avant tout le reste).
  if (subdomain && !RESERVED_SUBDOMAINS.includes(subdomain)) {
    const url = request.nextUrl.clone();
    url.pathname = `/sites/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- Cas 2 : protection /dashboard ---
  if (pathname.startsWith("/dashboard") && !request.auth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Cas 3 : protection /admin (doit être admin) ---
  if (pathname.startsWith("/admin")) {
    if (!request.auth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!request.auth.user?.isAdmin) {
      // Connecté mais pas admin : on renvoie sur le dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
