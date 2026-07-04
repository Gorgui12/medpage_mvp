/** @type {import('next').NextConfig} */
const nextConfig = {
  // Utile plus tard si tu affiches des photos de praticiens hébergées ailleurs
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
