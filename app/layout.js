// app/layout.js
import "./globals.css";
import Providers from "./components/Providers";

export const metadata = {
  title: "MedPage",
  description: "Créez le site de votre cabinet médical en 2 minutes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
