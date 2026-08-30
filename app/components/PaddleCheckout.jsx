// app/components/PaddleCheckout.jsx
"use client";

import Script from "next/script";

/**
 * Initialise Paddle.js (Billing) pour les checkouts "payment link".
 *
 * Le flux utilisé : la route /api/paddle/checkout crée la transaction côté
 * serveur et renvoie checkout.url, qui est une URL de l'app (même domaine)
 * avec le paramètre ?_ptxn=<txn_id>. Quand Paddle.js est chargé sur cette
 * page, il détecte le paramètre et ouvre le checkout en overlay
 * automatiquement. À la fin, il redirige vers settings.successUrl.
 *
 * Les variables sont publiques côté client (token et environnement le
 * sont chez Paddle) ; le secret de signature API (PADDLE_WEBHOOK_SECRET)
 * reste côté serveur uniquement.
 */
export default function PaddleCheckout() {
  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onReady={() => {
        if (typeof window !== "undefined" && window.Paddle) {
          const environment =
            process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
              ? "production"
              : "sandbox";
          const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

          const settings = {
            displayMode: "overlay",
            theme: "light",
            locale: "fr",
            // Après paiement, on ramène l'utilisateur sur son dashboard.
            successUrl: `${window.location.origin}/dashboard?payment=success`,
          };

          if (token) {
            window.Paddle.Initialize({
              token,
              environment,
              settings,
            });
          } else {
            console.warn(
              "Paddle.js non initialisé : NEXT_PUBLIC_PADDLE_CLIENT_TOKEN manquant."
            );
          }
        }
      }}
    />
  );
}