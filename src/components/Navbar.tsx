import { useEffect, useRef, useState } from "react";
import { Globe2, Volume2, VolumeX, ArrowUpRight, Menu, X } from "lucide-react";
import { useExperience } from "../store/useExperience";
import { unlockAudio } from "../hooks/useAudio";
export function Logo() {
  return (
    <a className="logo" href="#inicio">
      <Globe2 strokeWidth={1.3} />
      <span>
        WALK<span className="cyan">TALK</span>
        <small>COMUNICAÇÃO SEM FRONTEIRAS</small>
      </span>
    </a>
  );
}
const links = [
  { id: "inicio", label: "Início", href: "#inicio" },
  { id: "produto", label: "Produto", href: "/produto" },
  { id: "jornada", label: "Como funciona", href: "#jornada" },
  { id: "solucoes", label: "Empresas", href: "/solucoes" },
  { id: "saude", label: "Saúde", href: "/saude" },
  { id: "ajuda", label: "Ajuda", href: "/ajuda" },
];
export function Navbar() {
  const [active, setActive] = useState("inicio");
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sound = useExperience((s) => s.sound);
  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setOpen(false);
    };
    const dismissKeyboard = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      menuButton.current?.focus();
    };
    const dismissDesktop = () => {
      if (matchMedia("(min-width: 601px)").matches) setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissKeyboard);
    window.addEventListener("resize", dismissDesktop);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissKeyboard);
      window.removeEventListener("resize", dismissDesktop);
    };
  }, [open]);
  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      setProgress(height > 0 ? scrollY / height : 0);
      let current = "inicio";
      for (const link of links) {
        if (
          (document.getElementById(link.id)?.getBoundingClientRect().top ??
            Infinity) <
          innerHeight * 0.4
        )
          current = link.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <header className="header" ref={header}>
      <div className="nav-shell">
        <Logo />
        <nav
          id="primary-navigation"
          aria-label="Navegação principal"
          className={open ? "open" : ""}
        >
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              aria-current={active === link.id ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            className="icon-button sound-toggle hover:text-orbit transition-colors"
            aria-label={sound ? "Silenciar sons" : "Ativar sons"}
            aria-pressed={sound}
            onClick={() => {
              unlockAudio();
              useExperience.getState().toggleSound();
            }}
          >
            {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <a className="nav-cta" href="/portal" onClick={() => setOpen(false)}>
            Portal da empresa <ArrowUpRight size={15} />
          </a>
          <button
            ref={menuButton}
            className="icon-button menu-toggle"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <div
        className="reading-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
}
