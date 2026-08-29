// app/sitemap.js
// Sitemap racine de medpage.site. Les sites clients (sous-domaines) ont
// chacun leur propre sitemap à https://[subdomain].medpage.site/sitemap.xml
// (voir app/sites/[subdomain]/sitemap.js).
export default async function sitemap() {
  const baseUrl = "https://medpage.site";

  const staticPages = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1, lastModified: new Date() },
    { url: `${baseUrl}/create`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date() },
  ];

  return staticPages;
}
