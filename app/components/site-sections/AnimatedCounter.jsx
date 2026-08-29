// app/components/site-sections/AnimatedCounter.jsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compteur animé : compte de 0 vers la valeur cible quand il entre dans le
 * viewport, via IntersectionObserver + requestAnimationFrame (pas de lib).
 */
export default function AnimatedCounter({ value, suffix = "", decimal = false }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            // easing ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(value * eased);
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  const formatted = decimal ? display.toFixed(1) : Math.round(display).toLocaleString("fr-FR");

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
}
