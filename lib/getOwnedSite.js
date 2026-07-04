// lib/getOwnedSite.js
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";

/**
 * Récupère le site appartenant à l'utilisateur actuellement connecté
 * (session Auth.js), ou null si pas connecté / pas de site.
 *
 * Centralise la logique "qui est connecté + quel est son site" pour
 * toutes les routes du dashboard, plutôt que de redupliquer la
 * vérification de session + lookup Mongoose dans chaque route.
 */
export async function getOwnedSite() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, site: null };
  }

  await dbConnect();
  const site = await Site.findOne({ userId: session.user.id }).lean();

  return { session, site };
}
