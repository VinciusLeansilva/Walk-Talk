import { useEffect, useState } from "react";
import { useExperience } from "../store/useExperience";
/** Pauseable, bounded six-step demo. Stops when hidden, offscreen or operated manually. */
export function usePlayback() {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const state = useExperience.getState();
      if (state.step >= 5) {
        setPlaying(false);
        return;
      }
      state.setStep(state.step + 1);
    }, 2800);
    const hide = () => {
      if (document.hidden) setPlaying(false);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    });
    const panel = document.getElementById("simulator-panel");
    if (panel) observer.observe(panel);
    document.addEventListener("visibilitychange", hide);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", hide);
    };
  }, [playing]);
  const selectStep = (step: number) => {
    setPlaying(false);
    useExperience.getState().setStep(step);
  };
  const toggle = () => {
    if (!playing && useExperience.getState().step === 5)
      useExperience.getState().setStep(0);
    setPlaying(!playing);
  };
  return { playing, toggle, selectStep };
}
