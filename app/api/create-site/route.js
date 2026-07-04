// app/api/create-site/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import { generateEditToken } from "@/lib/token";
import { sendWelcomeEmail } from "@/lib/emails";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "medpage.com";

// Sous-domaines interdits car réservés à l'infrastructure de l'app elle-même
const RESERVED_SUBDOMAINS = ["app", "www", "api", "admin", "mail", "ftp"];

export async function POST(request) {
  try {
    // --- 0. Vérification de session : seul un compte connecté peut créer un site ---
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour créer un site." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      subdomain,
      cabinetName,
      doctorName,
      specialty,
      city,
      address,
      openingHours,
      phone,
      bookingUrl,
      mapUrl,
      themeColor,
      tagline,
      bio,
      profilePhotoUrl,
      coverPhotoUrl,
      galleryPhotos,
      services,
      testimonials,
      faq,
      socialLinks,
      notificationPreferences,
      notificationEmail,
      notificationWhatsapp,
    } = body;

    // --- 1. Validation basique des champs requis ---
    // Note : bookingUrl n'est plus obligatoire (le formulaire de RDV natif
    // suffit), mais on garde la possibilité de le renseigner en complément.
    const requiredFields = {
      subdomain,
      cabinetName,
      doctorName,
      specialty,
      city,
      phone,
    };

    const missing = Object.entries(requiredFields)
      .filter(([, value]) => !value || String(value).trim() === "")
      .map(([key]) => key);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Champs manquants : ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // --- 2. Normalisation et validation du format du sous-domaine ---
    const normalizedSubdomain = subdomain.trim().toLowerCase();

    const SUBDOMAIN_REGEX = /^[a-z0-9-]{3,63}$/;
    if (!SUBDOMAIN_REGEX.test(normalizedSubdomain)) {
      return NextResponse.json(
        {
          error:
            "Le sous-domaine doit contenir entre 3 et 63 caractères : lettres minuscules, chiffres et tirets uniquement.",
        },
        { status: 400 }
      );
    }

    if (RESERVED_SUBDOMAINS.includes(normalizedSubdomain)) {
      return NextResponse.json(
        { error: "Ce sous-domaine est réservé et ne peut pas être utilisé." },
        { status: 400 }
      );
    }

    // --- 3. Validation du format de la couleur (si fournie) ---
    const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}){1,2}$/;
    if (themeColor && !HEX_COLOR_REGEX.test(themeColor)) {
      return NextResponse.json(
        { error: "Le code couleur doit être au format hexadécimal (#RRGGBB)." },
        { status: 400 }
      );
    }

    // --- 3bis. Cohérence des préférences de notification ---
    // On revalide côté serveur ce que le formulaire impose déjà côté client :
    // ne jamais accepter un canal activé sans la coordonnée correspondante.
    if (notificationPreferences?.email && !notificationEmail?.trim()) {
      return NextResponse.json(
        { error: "Un email de notification est requis si le canal email est activé." },
        { status: 400 }
      );
    }
    if (notificationPreferences?.whatsapp && !notificationWhatsapp?.trim()) {
      return NextResponse.json(
        { error: "Un numéro WhatsApp est requis si le canal WhatsApp est activé." },
        { status: 400 }
      );
    }

    // --- 4. Connexion DB + vérification d'unicité du sous-domaine ---
    await dbConnect();

    const existing = await Site.findOne({ subdomain: normalizedSubdomain }).lean();

    if (existing) {
      return NextResponse.json(
        { error: "Ce sous-domaine est déjà pris. Merci d'en choisir un autre." },
        { status: 409 } // 409 Conflict : sémantiquement correct pour un doublon
      );
    }

    // --- 4bis. Un compte ne peut posséder qu'un seul site pour l'instant ---
    const alreadyOwnsSite = await Site.findOne({ userId: session.user.id }).lean();
    if (alreadyOwnsSite) {
      return NextResponse.json(
        { error: "Votre compte possède déjà un site MedPage." },
        { status: 409 }
      );
    }

    // --- 5. Création du document (MVP : toujours non publié à la création) ---
    const editToken = generateEditToken();

    const newSite = await Site.create({
      userId: session.user.id,
      subdomain: normalizedSubdomain,
      cabinetName: cabinetName.trim(),
      doctorName: doctorName.trim(),
      specialty: specialty.trim(),
      city: city.trim(),
      address: address?.trim() || "",
      openingHours: openingHours?.trim() || "Lun - Ven : 9h00 - 18h00",
      phone: phone.trim(),
      bookingUrl: bookingUrl?.trim() || "",
      mapUrl: mapUrl?.trim() || "",
      themeColor: themeColor || "#0EA5A8",
      tagline: tagline?.trim() || "",
      bio: bio?.trim() || "",
      profilePhotoUrl: profilePhotoUrl || "",
      coverPhotoUrl: coverPhotoUrl || "",
      galleryPhotos: Array.isArray(galleryPhotos) ? galleryPhotos.slice(0, 8) : [],
      services: Array.isArray(services) ? services.slice(0, 12) : [],
      testimonials: Array.isArray(testimonials) ? testimonials.slice(0, 10) : [],
      faq: Array.isArray(faq) ? faq.slice(0, 10) : [],
      socialLinks: {
        facebook: socialLinks?.facebook?.trim() || "",
        instagram: socialLinks?.instagram?.trim() || "",
        whatsapp: socialLinks?.whatsapp?.trim() || "",
        linkedin: socialLinks?.linkedin?.trim() || "",
      },
      notificationPreferences: {
        email: Boolean(notificationPreferences?.email),
        whatsapp: Boolean(notificationPreferences?.whatsapp),
      },
      notificationEmail: notificationEmail?.trim() || "",
      notificationWhatsapp: notificationWhatsapp?.trim() || "",
      isPublished: false, // le site ne sera activé qu'après paiement Stripe
      editToken,
    });

    const previewUrl = `https://${normalizedSubdomain}.${ROOT_DOMAIN}`;

    // --- 6. Réponse : on renvoie le site créé + son editToken (UNE SEULE FOIS) ---
    // Le client DOIT sauvegarder ce token (ex: dans le localStorage ou par email)
    // car il ne sera plus jamais renvoyé par l'API ensuite (champ select: false).
    // --- Email de bienvenue (best-effort : une erreur d'envoi ne bloque pas la création) ---
    if (process.env.RESEND_API_KEY) {
      sendWelcomeEmail({
        to: session.user.email,
        doctorName: newSite.doctorName,
        subdomain: newSite.subdomain,
        trialEndsAt: newSite.trialEndsAt,
      }).catch((err) => console.error("Email bienvenue échoué :", err));
    }

    return NextResponse.json(
      {
        message: "Site créé avec succès. Votre essai gratuit de 14 jours démarre maintenant.",
        site: {
          subdomain: newSite.subdomain,
          cabinetName: newSite.cabinetName,
          isPublished: newSite.isPublished,
          trialEndsAt: newSite.trialEndsAt,
        },
        editToken,
        previewUrl,
      },
      { status: 201 }
    );
  } catch (err) {
    // Erreur de validation Mongoose (ex: regex non respectée au niveau schéma)
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0]?.message || "Données invalides.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // Erreur de duplicate key MongoDB (race condition possible malgré le check ci-dessus)
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Ce sous-domaine est déjà pris. Merci d'en choisir un autre." },
        { status: 409 }
      );
    }

    console.error("Erreur création site :", err);
    return NextResponse.json(
      { error: "Erreur serveur. Merci de réessayer." },
      { status: 500 }
    );
  }
}
