// app/api/appointments/list/route.js
import { NextResponse } from "next/server";
import { getOwnedSite } from "@/lib/getOwnedSite";
import Appointment from "@/models/Appointment";

/**
 * Route PROTÉGÉE : seul le médecin connecté peut lister les demandes de
 * RDV de son propre site. Utilisée par le dashboard.
 */
export async function GET() {
  try {
    const { session, site } = await getOwnedSite();

    if (!session) {
      return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    }
    if (!site) {
      return NextResponse.json({ error: "Aucun site associé à ce compte." }, { status: 404 });
    }

    const appointments = await Appointment.find({ siteId: site._id })
      .sort({ createdAt: -1 }) // les plus récentes d'abord
      .lean();

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (err) {
    console.error("Erreur récupération RDV :", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
