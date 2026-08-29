// app/sites/[subdomain]/sitemap.js
// Sitemap propre à chaque sous-domaine client :
// https://dr-durand.medpage.site/sitemap.xml
import { dbConnect } from "@/lib/mongodb";
import Site from "@/models/Site";
import { isSiteAccessible } from "@/lib/siteAccess";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export default async function sitemap({ params }) {
  const { subdomain } = (await params) || {};
  if (!subdomain) return [];
  const baseUrl = `https://${subdomain}.medpage.site`;

  // On ne génère un sitemap que si le site est publié/accessible,
  // sinon on renvoie un sitemap vide (pas d'indexation des sites hors trial).
  let accessible = false;
  try {
    await dbConnect();
    const site = await Site.findOne({ subdomain: subdomain.toLowerCase() }).lean();
    accessible = isSiteAccessible(site);
  } catch {
    accessible = false;
  }

  if (!accessible) return [];

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1, lastModified: new Date() },
    { url: `${baseUrl}/#services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/#contact`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/#testimonials`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
