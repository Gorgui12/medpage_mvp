// app/components/site-sections/SiteHeader.jsx
"use client";

import { useState, useEffect } from "react";
import { Phone, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#about", label: "À propos" },
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Galerie" },
  { href: "#testimonials", label: "Avis" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader({ site, accent }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const phoneHref = `tel:${site.phone.replace(/\s+/g, "")}`;

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleNavClick() {
    setIsMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md transition-shadow ${
        isScrolled ? "shadow-sm border-b border-slate-100" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-bold tracking-tight leading-none" style={{ color: accent }}>
            {site.cabinetName}
          </p>
          <p className="text-xs text-slate-400">{site.city}</p>
        </div>

        {/* --- Navigation desktop --- */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={phoneHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <Phone className="h-4 w-4" />
            {site.phone}
          </a>
          <a
            href="#contact"
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            Prendre RDV
          </a>
        </div>

        {/* --- Bouton menu mobile --- */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="md:hidden p-2 text-slate-600"
          aria-label="Menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* --- Menu mobile déroulant --- */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="block text-sm font-medium text-slate-700 py-1.5"
            >
              {link.label}
            </a>
          ))}
          <a
            href={phoneHref}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 py-1.5"
          >
            <Phone className="h-4 w-4" />
            {site.phone}
          </a>
          <a
            href="#contact"
            onClick={handleNavClick}
            className="block text-center mt-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold"
            style={{ backgroundColor: accent }}
          >
            Prendre RDV
          </a>
        </nav>
      )}
    </header>
  );
}
