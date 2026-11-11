"use client";
import { lazy } from "react";
import { MotionConfig } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { Hero } from "./sections/Hero";
import { Footer } from "./components/Footer";
import { Cursor } from "./components/Cursor";
import { DeferredSection } from "./components/DeferredSection";
import { useAudio } from "./hooks/useAudio";
import { useInstall } from "./hooks/useInstall";
import { useExperienceEffects } from "./hooks/useExperienceEffects";
import { Enterprise } from "./sections/Enterprise";
const FieldExperience = lazy(() =>
  import("./sections/FieldExperience").then((module) => ({
    default: module.FieldExperience,
  })),
);
const Journey = lazy(() =>
  import("./sections/Journey").then((module) => ({ default: module.Journey })),
);
const Coverage = lazy(() =>
  import("./sections/Coverage").then((module) => ({
    default: module.Coverage,
  })),
);
const Benefits = lazy(() =>
  import("./sections/Benefits").then((module) => ({
    default: module.Benefits,
  })),
);
export default function App() {
  useAudio();
  useExperienceEffects();
  const installState = useInstall();
  return (
    <MotionConfig reducedMotion="user">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo">
        <Hero />
        <DeferredSection id="expedicao">
          <FieldExperience />
        </DeferredSection>
        <DeferredSection id="jornada" alias="simulador">
          <Journey />
        </DeferredSection>
        <DeferredSection id="cobertura">
          <Coverage />
        </DeferredSection>
        <DeferredSection id="beneficios">
          <Benefits installState={installState} />
        </DeferredSection>
        <Enterprise />
      </main>
      <Footer />
      <Cursor />
    </MotionConfig>
  );
}
