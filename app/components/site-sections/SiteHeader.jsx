// app/components/site-sections/SiteHeader.jsx
"use client";

import { useState, useEffect } from "react";
import { Phone, Menu, X, CalendarCheck2 } from "lucide-react";

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
      // Barre de progression du scroll
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (scrolled / total) * 100 : 0;
      document
        .getElementById("scroll-progress")
        ?.style.setProperty("width", `${progress}%`);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bloque le scroll du body quand le drawer mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  function handleNavClick() {
    setIsMenuOpen(false);
  }

  return (
    <>
      {/* Barre de progression du scroll */}
      <div
        id="scroll-progress"
        className="fixed top-0 left-0 h-[3px] z-[9999] transition-[width] duration-75"
        style={{ backgroundColor: accent, width: "0%" }}
      />

      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? "backdrop-blur-xl bg-white/85 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-b border-slate-100"
            : "bg-white/40 backdrop-blur-md"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 md:h-[72px] flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-3 shrink-0">
            <span className="font-playfair text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-none">
              {site.cabinetName}
            </span>
            <span
              className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${accent}26`, color: accent }}
            >
              {site.specialty}
            </span>
          </a>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Phone className="h-4 w-4" style={{ color: accent }} />
              {site.phone}
            </a>
            <a
              href={site.bookingUrl || "#contact"}
              target={site.bookingUrl ? "_blank" : undefined}
              rel={site.bookingUrl ? "noopener noreferrer" : undefined}
              className="cta-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            >
              <CalendarCheck2 className="h-4 w-4" />
              Prendre RDV
            </a>
          </div>

          {/* Bouton menu mobile */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Ouvrir le menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Drawer mobile (slide-in depuis la droite) */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay sombre */}
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        {/* Panneau */}
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
            <span className="font-playfair text-lg font-bold text-slate-900">
              {site.cabinetName}
            </span>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-6 py-6 flex flex-col gap-1 overflow-y-auto">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-3 transition"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="px-6 pb-8 space-y-3 border-t border-slate-100 pt-6">
            <a
              href={phoneHref}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              <Phone className="h-5 w-5" style={{ color: accent }} />
              {site.phone}
            </a>
            <a
              href="#contact"
              onClick={handleNavClick}
              className="cta-primary flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-white font-semibold"
            >
              <CalendarCheck2 className="h-5 w-5" />
              Prendre RDV
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
