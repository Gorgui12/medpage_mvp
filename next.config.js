/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compression maximale (toujours active dans Next 15+ ; gardé explicite)
  compress: true,

  // Optimisation des images (Cloudinary + sous-domaines)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.medpage.site" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // cache images : 30 jours
  },

  // Headers SEO et sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // CSP compatible avec tous les services tiers déjà intégrés
          // (Paddle, widget Cloudinary, Google Maps, _next/image, JSON-LD
          // inline). Le but est une couche de défense sans casser les
          // scripts injectés par ces fournisseurs.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://upload-widget.cloudinary.com https://widget.cloudinary.com https://res.cloudinary.com https://cdn.paddle.com https://checkout.paddle.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' data: blob: https:",
              "frame-src https: data: https://upload-widget.cloudinary.com https://widget.cloudinary.com https://checkout.paddle.com",
              "style-src 'self' 'unsafe-inline' https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self' https:",
            ].join("; "),
          },
        ],
      },
      {
        // Cache agressif pour les assets statiques compilés par Next
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Amélioration du bundle en important uniquement les icônes utilisées
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  allowedDevOrigins: ["*.localhost"],
};

module.exports = nextConfig;
