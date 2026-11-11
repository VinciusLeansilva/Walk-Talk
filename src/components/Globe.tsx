import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useMedia } from "../hooks/useExperienceEffects";
const EarthScene = lazy(() => import("./EarthScene"));
function EarthFallback() {
  return (
    <div className="earth-fallback" aria-hidden="true">
      <div className="earth-flat" />
      <div className="flat-orbit one" />
      <div className="flat-orbit two" />
    </div>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <EarthFallback /> : this.props.children;
  }
}
export function Globe({ story = false }: { story?: boolean }) {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const narrow = useMedia("(max-width: 600px)");
  const [visible, setVisible] = useState(!story);
  const [webgl, setWebgl] = useState<boolean | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);
  const device = (
    typeof navigator !== "undefined" ? navigator : {}
  ) as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const lowPower =
    reduced ||
    !!device.connection?.saveData ||
    (narrow &&
      ((device.deviceMemory ?? 4) <= 4 ||
        (device.hardwareConcurrency ?? 4) <= 4));
  const lightweight = lowPower || !webgl;
  useEffect(() => {
    if (lowPower || !visible || webgl !== undefined) return;
    // Canvas is created only after the initial UI has painted. Its error boundary
    // handles unsupported WebGL without allocating a second test context.
    const timer = window.setTimeout(() => setWebgl(true), 700);
    return () => window.clearTimeout(timer);
  }, [lowPower, visible, webgl]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "180px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`globe-wrap ${story ? "story-globe" : ""}`} ref={ref}>
      {lightweight || !visible ? (
        <EarthFallback />
      ) : (
        <SceneBoundary>
          <Suspense fallback={<EarthFallback />}>
            <>
              {!ready && <EarthFallback />}
              <EarthScene story={story} onReady={onReady} />
            </>
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
