// app/api/appointments/update-status/route.js
import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/getOwnedSite";
import Appointment from "@/models/Appointment";

const VALID_STATUSES = ["new", "contacted", "confirmed", "cancelled"];

export async function PATCH(request) {
  try {
    const { session, site } = await getOwnedSite();

    if (!session) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    }
    if (!site) {
      return NextResponse.json({ error: "Aucun site associé à ce compte." }, { status: 404 });
    }

    const { appointmentId, status } = await request.json();

    if (!appointmentId || !status) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    // On vérifie que le RDV appartient bien à CE site, pour empêcher
    // un médecin de modifier les RDV d'un autre cabinet en devinant un ID.
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, siteId: site._id },
      { status },
      { new: true }
    );

    if (!appointment) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (err) {
    console.error("Erreur mise à jour statut RDV :", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
