// app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/api/", "/login", "/register"],
      },
    ],
    sitemap: "https://medpage.site/sitemap.xml",
    host: "https://medpage.site",
  };
}
