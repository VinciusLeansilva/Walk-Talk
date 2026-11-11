import { useEffect, useRef } from "react";
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)")
        .matches
    )
      return;
    const move = (event: PointerEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${event.clientX - 12}px,${event.clientY - 12}px,0)`;
        ref.current.style.opacity = "1";
        ref.current.classList.toggle(
          "over-link",
          !!(event.target as HTMLElement).closest("button,a"),
        );
      }
    };
    const leave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <div ref={ref} className="custom-cursor" aria-hidden="true" />;
}
