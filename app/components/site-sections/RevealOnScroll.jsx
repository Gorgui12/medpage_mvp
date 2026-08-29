// app/components/site-sections/RevealOnScroll.jsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wrapper léger qui fait apparaître son contenu quand il entre dans le
 * viewport via IntersectionObserver natif (pas de librairie d'animation).
 *
 * Props :
 *  - variant : "fade" | "slide-up" | "slide-left" | "slide-right" | "scale"
 *  - delay    : délai d'animation en ms (staggering)
 *
 * Chaque section peut choisir sa variante pour créer du rythme visuel.
 */
const variants = {
  fade: { hidden: "opacity-0", show: "opacity-100" },
  "slide-up": {
    hidden: "opacity-0 translate-y-12",
    show: "opacity-100 translate-y-0",
  },
  "slide-left": {
    hidden: "opacity-0 translate-x-12",
    show: "opacity-100 translate-x-0",
  },
  "slide-right": {
    hidden: "opacity-0 -translate-x-12",
    show: "opacity-100 translate-x-0",
  },
  scale: {
    hidden: "opacity-0 scale-95",
    show: "opacity-100 scale-100",
  },
};

export default function RevealOnScroll({
  children,
  delay = 0,
  variant = "slide-up",
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const v = variants[variant] || variants["slide-up"];

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
      className={`transition-all duration-700 ease-out will-change-transform ${
        isVisible ? v.show : v.hidden
      }`}
    >
      {children}
    </div>
  );
}
