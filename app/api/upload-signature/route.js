// app/api/upload-signature/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

/**
 * Génère une signature Cloudinary valide pour un upload signé.
 * Le widget d'upload côté client appelle cette route AVANT d'envoyer
 * le fichier à Cloudinary, pour prouver que l'upload vient bien de notre app
 * (et pas d'un tiers qui aurait deviné notre cloud_name).
 *
 * PROTÉGÉE : seul un utilisateur connecté peut obtenir une signature,
 * sinon n'importe qui pourrait uploader des fichiers illimités sur
 * le compte Cloudinary (coût + stockage arbitraire).
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour uploader une image." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const rawParams = body?.paramsToSign;

    if (!rawParams || typeof rawParams !== "object" || Array.isArray(rawParams)) {
      return NextResponse.json(
        { error: "paramsToSign manquant ou invalide." },
        { status: 400 }
      );
    }

    // On ne signe que des paramètres scalaires (protection contre les
    // objets/tableaux imbriqués injectés dans la chaîne à signer).
    const paramsToSign = {};
    for (const [key, value] of Object.entries(rawParams)) {
      if (typeof value === "string" || typeof value === "number") {
        paramsToSign[key] = value;
      }
    }

    // Le timestamp est obligatoire chez Cloudinary : on l'impose côté
    // serveur si le widget ne l'a pas fourni.
    if (!paramsToSign.timestamp) {
      paramsToSign.timestamp = Math.floor(Date.now() / 1000);
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({ signature }, { status: 200 });
  } catch (err) {
    console.error("Erreur génération signature Cloudinary :", err);
    return NextResponse.json(
      { error: "Impossible de générer la signature." },
      { status: 500 }
    );
  }
}
