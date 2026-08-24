// app/api/sites/update/route.js
import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/getOwnedSite";
import Site from "@/models/Site";

// Champs que le médecin a le droit de modifier lui-même.
// On exclut volontairement subdomain, isPublished, userId, champs Paddle.
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

    // getOwnedSite() renvoie un objet .lean() (POJO) sans méthode .save().
    // On recharge donc le document Mongoose complet avant de le muter.
    const doc = await Site.findById(site._id);
    if (!doc) {
      return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
    }

    // On ne retient que les champs autorisés, le reste est ignoré silencieusement
    for (const field of EDITABLE_FIELDS) {
      if (updates[field] !== undefined) {
        doc[field] = updates[field];
      }
    }

    await doc.save(); // déclenche les validations Mongoose (regex couleur, etc.)

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
