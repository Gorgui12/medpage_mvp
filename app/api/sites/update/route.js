// app/api/sites/update/route.js
import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/getOwnedSite";

// Champs que le médecin a le droit de modifier lui-même.
// On exclut volontairement subdomain, isPublished, userId, champs Stripe.
const EDITABLE_FIELDS = [
  "cabinetName",
  "doctorName",
  "specialty",
  "city",
  "address",
  "openingHours",
  "phone",
  "bookingUrl",
  "mapUrl",
  "themeColor",
  "tagline",
  "bio",
  "profilePhotoUrl",
  "coverPhotoUrl",
  "galleryPhotos",
  "services",
  "testimonials",
  "faq",
  "socialLinks",
  "notificationPreferences",
  "notificationEmail",
  "notificationWhatsapp",
];

export async function PATCH(request) {
  try {
    const { session, site } = await getOwnedSite();

    if (!session) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    }
    if (!site) {
      return NextResponse.json({ error: "Aucun site associé à ce compte." }, { status: 404 });
    }

    const updates = await request.json();

    // On ne retient que les champs autorisés, le reste est ignoré silencieusement
    for (const field of EDITABLE_FIELDS) {
      if (updates[field] !== undefined) {
        site[field] = updates[field];
      }
    }

    await site.save(); // déclenche les validations Mongoose (regex couleur, etc.)

    return NextResponse.json(
      { message: "Site mis à jour avec succès." },
      { status: 200 }
    );
  } catch (err) {
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0]?.message || "Données invalides.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    console.error("Erreur mise à jour site :", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
