import { useEffect, useState } from "react";
import { useExperience } from "../store/useExperience";

export function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export function useExperienceEffects() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    // Touch devices already have native momentum scrolling.
    if (!reduced && matchMedia("(pointer: fine)").matches) {
      void Promise.all([import("lenis"), import("gsap")]).then(
        ([{ default: Lenis }, { gsap }]) => {
          if (disposed) return;
          const lenis = new Lenis({
            duration: 1.05,
            smoothWheel: true,
            anchors: { offset: -90 },
          });
          const tick = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(tick);
          cleanup = () => {
            gsap.ticker.remove(tick);
            lenis.destroy();
          };
        },
      );
    }
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduced]);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    // Load storytelling only as its section approaches the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
          ([{ gsap }, { ScrollTrigger }]) => {
            if (disposed) return;
            gsap.registerPlugin(ScrollTrigger);
            const trigger = ScrollTrigger.create({
              trigger: "#jornada",
              start: "top 75%",
              end: "bottom 35%",
              onUpdate: (self) => {
                const state = useExperience.getState();
                state.setJourney(self.progress);
                state.setScrollStep(Math.min(5, Math.floor(self.progress * 6)));
              },
            });
            const resize = new ResizeObserver(() => trigger.refresh());
            const target = document.getElementById("jornada");
            if (target) resize.observe(target);
            cleanup = () => {
              resize.disconnect();
              trigger.kill();
            };
          },
        );
      },
      { rootMargin: "150px" },
    );
    const resume = () => useExperience.getState().resumeScroll();
    const keyboardScroll = (event: KeyboardEvent) => {
      if (["PageDown", "PageUp", "ArrowDown", "ArrowUp"].includes(event.key))
        resume();
    };
    window.addEventListener("wheel", resume, { passive: true });
    window.addEventListener("touchmove", resume, { passive: true });
    window.addEventListener("keydown", keyboardScroll);
    const section = document.getElementById("jornada");
    if (section) observer.observe(section);
    return () => {
      disposed = true;
      observer.disconnect();
      cleanup?.();
      window.removeEventListener("wheel", resume);
      window.removeEventListener("touchmove", resume);
      window.removeEventListener("keydown", keyboardScroll);
    };
  }, []);
}
