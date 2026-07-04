// app/api/upload-signature/route.js
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

/**
 * Génère une signature Cloudinary valide pour un upload signé.
 * Le widget d'upload côté client appelle cette route AVANT d'envoyer
 * le fichier à Cloudinary, pour prouver que l'upload vient bien de notre app
 * (et pas d'un tiers qui aurait deviné notre cloud_name).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return NextResponse.json(
        { error: "paramsToSign manquant." },
        { status: 400 }
      );
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
