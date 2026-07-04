// app/api/appointments/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import Appointment from "@/models/Appointment";

/**
 * Route PUBLIQUE (pas de editToken requis) : un patient anonyme depuis
 * le site d'un cabinet soumet une demande de RDV. On vérifie seulement
 * que le site existe et est publié, pour éviter de stocker des demandes
 * orphelines ou de spammer un site désactivé.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { subdomain, patientName, patientPhone, patientEmail, preferredDate, reason } = body;

    if (!subdomain || !patientName?.trim() || !patientPhone?.trim()) {
      return NextResponse.json(
        { error: "Nom et téléphone sont obligatoires." },
        { status: 400 }
      );
    }

    await dbConnect();

    const site = await Site.findOne({
      subdomain: subdomain.toLowerCase(),
      isPublished: true,
    });

    if (!site) {
      return NextResponse.json(
        { error: "Ce cabinet n'est pas disponible pour le moment." },
        { status: 404 }
      );
    }

    const appointment = await Appointment.create({
      siteId: site._id,
      subdomain: site.subdomain,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail?.trim() || "",
      preferredDate: preferredDate?.trim() || "",
      reason: reason?.trim() || "",
      status: "new",
    });

    // --- Notification best-effort : si elle échoue, la demande reste
    // stockée et visible dans le dashboard, donc rien n'est perdu. ---
    try {
      await notifyDoctor(site, appointment);
    } catch (notifyErr) {
      console.error("Notification échouée (non bloquant) :", notifyErr);
    }

    return NextResponse.json(
      { message: "Votre demande de rendez-vous a bien été envoyée." },
      { status: 201 }
    );
  } catch (err) {
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0]?.message || "Données invalides.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    console.error("Erreur création RDV :", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * Envoie une notification au médecin selon ses préférences.
 * Email via Resend si configuré, WhatsApp via lien (voir note dans le code) —
 * pour le MVP, le canal WhatsApp se contente de logguer un lien cliquable
 * tant qu'aucune intégration officielle WhatsApp Business API n'est branchée.
 */
async function notifyDoctor(site, appointment) {
  const prefs = site.notificationPreferences || {};

  if (prefs.email && site.notificationEmail && process.env.RESEND_API_KEY) {
    await sendEmailNotification(site, appointment);
  }

  if (prefs.whatsapp && site.notificationWhatsapp) {
    // L'API WhatsApp Business nécessite une validation Meta + un numéro
    // dédié : hors scope du MVP. On prépare seulement le lien wa.me ici ;
    // une vraie intégration (Twilio/Meta Cloud API) pourra le remplacer
    // sans changer la route /api/appointments elle-même.
    console.log(
      `[notif WhatsApp à implémenter] Nouveau RDV pour ${site.subdomain} -> ${site.notificationWhatsapp}`
    );
  }
}

async function sendEmailNotification(site, appointment) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "MedPage <notifications@medpage.com>",
    to: site.notificationEmail,
    subject: `Nouvelle demande de RDV — ${appointment.patientName}`,
    html: `
      <h2>Nouvelle demande de rendez-vous</h2>
      <p><strong>Patient :</strong> ${appointment.patientName}</p>
      <p><strong>Téléphone :</strong> ${appointment.patientPhone}</p>
      ${appointment.patientEmail ? `<p><strong>Email :</strong> ${appointment.patientEmail}</p>` : ""}
      ${appointment.preferredDate ? `<p><strong>Créneau souhaité :</strong> ${appointment.preferredDate}</p>` : ""}
      ${appointment.reason ? `<p><strong>Motif :</strong> ${appointment.reason}</p>` : ""}
      <p>Connectez-vous à votre tableau de bord MedPage pour gérer cette demande.</p>
    `,
  });
}
