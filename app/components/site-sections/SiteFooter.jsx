// app/components/site-sections/SiteFooter.jsx
import { Facebook, Instagram, Linkedin, MessageCircle, MapPin, Phone, Mail } from "lucide-react";

export default function SiteFooter({ site }) {
  const { socialLinks } = site;
  const hasSocials =
    socialLinks &&
    (socialLinks.facebook || socialLinks.instagram || socialLinks.whatsapp || socialLinks.linkedin);

  const quickLinks = [
    { href: "#about", label: "À propos" },
    { href: "#services", label: "Services" },
    { href: "#gallery", label: "Galerie" },
    { href: "#testimonials", label: "Avis" },
    { href: "#contact", label: "Contact" },
  ];

  const socials = [];
  if (socialLinks?.facebook)
    socials.push({ href: socialLinks.facebook, icon: <Facebook className="h-5 w-5" />, label: "Facebook" });
  if (socialLinks?.instagram)
    socials.push({ href: socialLinks.instagram, icon: <Instagram className="h-5 w-5" />, label: "Instagram" });
  if (socialLinks?.linkedin)
    socials.push({ href: socialLinks.linkedin, icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" });
  if (socialLinks?.whatsapp)
    socials.push({
      href: `https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, "")}`,
      icon: <MessageCircle className="h-5 w-5" />,
      label: "WhatsApp",
    });

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Zone 1 : logo + signature + réseaux */}
          <div>
            <p className="font-playfair text-2xl font-bold text-white">
              {site.cabinetName}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-xs">
              Dr. {site.doctorName} • {site.specialty} à {site.city}. Des soins
              attentifs et modernes, au plus près de vos besoins.
            </p>
            {hasSocials && (
              <div className="mt-6 flex items-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="social-icon h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-transparent transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Zone 2 : liens rapides */}
          <div>
            <p className="font-dm text-xs uppercase tracking-widest text-slate-500 mb-5">
              Navigation
            </p>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span className="h-px w-4" style={{ backgroundColor: "var(--accent, #0ea5a8)" }} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Zone 3 : contact rapide */}
          <div>
            <p className="font-dm text-xs uppercase tracking-widest text-slate-500 mb-5">
              Contact
            </p>
            <ul className="space-y-4 text-sm">
              {(site.address || site.city) && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--accent, #0ea5a8)" }} />
                  <span className="text-slate-400">{site.address || site.city}</span>
                </li>
              )}
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--accent, #0ea5a8)" }} />
                <a href={`tel:${site.phone.replace(/\s+/g, "")}`} className="text-slate-400 hover:text-white transition-colors">
                  {site.phone}
                </a>
              </li>
              {site.openingHours && (
                <li className="flex items-start gap-3">
                  <svg className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--accent, #0ea5a8)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" strokeLinecap="round" />
                  </svg>
                  <span className="text-slate-400">{site.openingHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bande du bas */}
      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {site.cabinetName}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Propulsé par{" "}
              <span className="font-semibold text-slate-300">MedPage</span>
            </span>
            <span className="text-slate-700">|</span>
            <span>Mentions légales</span>
            <span className="text-slate-700">|</span>
            <span>Politique de confidentialité</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
