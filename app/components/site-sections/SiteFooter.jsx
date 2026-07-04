// app/components/site-sections/SiteFooter.jsx
import { Facebook, Instagram, Linkedin, MessageCircle } from "lucide-react";

export default function SiteFooter({ site }) {
  const { socialLinks } = site;
  const hasSocials =
    socialLinks &&
    (socialLinks.facebook || socialLinks.instagram || socialLinks.whatsapp || socialLinks.linkedin);

  return (
    <footer className="border-t border-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-4">
        {hasSocials && (
          <div className="flex items-center gap-4">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-slate-400 hover:text-slate-700 transition" />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-slate-400 hover:text-slate-700 transition" />
              </a>
            )}
            {socialLinks.whatsapp && (
              <a
                href={`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5 text-slate-400 hover:text-slate-700 transition" />
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-slate-400 hover:text-slate-700 transition" />
              </a>
            )}
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {site.cabinetName} — Site propulsé par{" "}
          <span className="font-medium text-slate-500">MedPage</span>
        </p>
      </div>
    </footer>
  );
}
