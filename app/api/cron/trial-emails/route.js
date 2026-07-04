// app/api/cron/trial-emails/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import User from "@/models/User";
import { sendTrialEndingSoonEmail, sendTrialExpiredEmail } from "@/lib/emails";

/**
 * Route appelée automatiquement une fois par jour par Vercel Cron Jobs.
 * Protégée par CRON_SECRET pour éviter les appels non autorisés.
 *
 * Configure dans vercel.json :
 * { "crons": [{ "path": "/api/cron/trial-emails", "schedule": "0 9 * * *" }] }
 * → s'exécute chaque matin à 9h UTC.
 */
export async function GET(request) {
  // Vérification du secret Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  await dbConnect();

  const now = new Date();
  let sentWarning = 0;
  let sentExpired = 0;

  // --- 1. Sites dont le trial expire dans exactement 3 jours (±12h) ---
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const warningStart = new Date(in3Days.getTime() - 12 * 60 * 60 * 1000);
  const warningEnd = new Date(in3Days.getTime() + 12 * 60 * 60 * 1000);

  const expiringSoon = await Site.find({
    trialEndsAt: { $gte: warningStart, $lte: warningEnd },
    trialRevoked: false,
    isPublished: false, // pas encore converti en payant
    userId: { $exists: true },
  });

  for (const site of expiringSoon) {
    const user = await User.findById(site.userId);
    if (!user?.email) continue;
    try {
      await sendTrialEndingSoonEmail({
        to: user.email,
        doctorName: site.doctorName,
        daysRemaining: 3,
        trialEndsAt: site.trialEndsAt,
      });
      sentWarning++;
    } catch (err) {
      console.error(`Email J-3 échoué pour ${site.subdomain} :`, err.message);
    }
  }

  // --- 2. Sites dont le trial vient d'expirer (dans les dernières 24h) ---
  const expiredStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const justExpired = await Site.find({
    trialEndsAt: { $gte: expiredStart, $lte: now },
    trialRevoked: false,
    isPublished: false,
    userId: { $exists: true },
  });

  for (const site of justExpired) {
    const user = await User.findById(site.userId);
    if (!user?.email) continue;
    try {
      await sendTrialExpiredEmail({ to: user.email, doctorName: site.doctorName });
      sentExpired++;
    } catch (err) {
      console.error(`Email expired échoué pour ${site.subdomain} :`, err.message);
    }
  }

  return NextResponse.json({
    ok: true,
    sentWarning,
    sentExpired,
    timestamp: now.toISOString(),
  });
}
