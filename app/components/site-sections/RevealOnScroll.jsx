// app/components/site-sections/RevealOnScroll.jsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wrapper léger qui fait apparaître son contenu (fade + slide-up) quand il
 * entre dans le viewport. Utilise IntersectionObserver natif plutôt qu'une
 * librairie d'animation lourde, pour ne pas alourdir le temps de chargement
 * du site (chaque kilo-octet compte pour le SEO et l'expérience mobile).
 */
export default function RevealOnScroll({ children, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // on n'anime qu'une fois, pas à chaque scroll
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}
