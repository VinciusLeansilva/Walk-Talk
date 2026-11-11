import { Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
export function DeferredSection({
  id,
  alias,
  children,
}: {
  id: string;
  alias?: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if ([id, alias].includes(location.hash.slice(1))) setVisible(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [id, alias]);
  const fallback = (
    <div
      className={`section-placeholder placeholder-${id}`}
      role="status"
      aria-label="Carregando seção"
    >
      <span className="status-dot" />
    </div>
  );
  return (
    <div id={id} ref={ref}>
      {alias && <span id={alias} className="anchor-alias" />}
      <Suspense fallback={fallback}>{visible ? children : fallback}</Suspense>
    </div>
  );
}
