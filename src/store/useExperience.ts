import { create } from "zustand";

type Experience = {
  step: number;
  ptt: boolean;
  sound: boolean;
  detailed: boolean;
  pulse: number;
  journey: number;
  manual: boolean;
  resumeScroll: () => void;
  setScrollStep: (step: number) => void;
  setStep: (step: number) => void;
  setPTT: (active: boolean) => void;
  toggleSound: () => void;
  setDetailed: (value: boolean) => void;
  setJourney: (value: number) => void;
};
export const useExperience = create<Experience>((set) => ({
  step: 0,
  ptt: false,
  sound: false,
  detailed: false,
  pulse: 0,
  journey: 0,
  manual: false,
  resumeScroll: () => set({ manual: false }),
  setScrollStep: (step) =>
    set((s) => (s.manual ? s : { step: Math.max(0, Math.min(5, step)) })),
  setStep: (step) =>
    set({ step: Math.max(0, Math.min(5, step)), manual: true }),
  setPTT: (active) =>
    set((s) =>
      s.ptt === active
        ? s
        : { ptt: active, pulse: !active ? s.pulse + 1 : s.pulse },
    ),
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  setDetailed: (detailed) => set({ detailed }),
  setJourney: (journey) => set({ journey }),
}));
