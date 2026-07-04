// app/api/admin/site-action/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";

const VALID_ACTIONS = ["activate", "deactivate", "extend_trial", "revoke_trial"];

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const { siteId, action } = await request.json();

    if (!siteId || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
    }

    await dbConnect();
    const site = await Site.findById(siteId);

    if (!site) {
      return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
    }

    switch (action) {
      case "activate":
        site.isPublished = true;
        site.stripeSubscriptionStatus = "active";
        break;

      case "deactivate":
        site.isPublished = false;
        site.stripeSubscriptionStatus = "canceled";
        break;

      case "extend_trial":
        // On prolonge depuis maintenant si expiré, sinon depuis la date courante
        const base = site.trialEndsAt > new Date() ? site.trialEndsAt : new Date();
        site.trialEndsAt = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000);
        site.trialRevoked = false;
        break;

      case "revoke_trial":
        site.trialRevoked = true;
        break;
    }

    await site.save();

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Erreur action admin :", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
