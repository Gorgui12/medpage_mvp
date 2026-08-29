// app/layout.js
import "./globals.css";
import Providers from "./components/Providers";

export const metadata = {
  title: "MedPage",
  description: "Créez le site de votre cabinet médical en 2 minutes.",
  metadataBase: new URL("https://medpage.site"),
  alternates: {
    canonical: "https://medpage.site",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <head>
        {/* Préconnexions et DNS prefetch pour les ressources tierces critiques */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.paddle.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
