"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Globe2, Menu, X } from "lucide-react";
import "./public-pages.css";

const navigation = [
  ["/produto", "Produto"],
  ["/solucoes", "Soluções"],
  ["/saude", "Saúde ocupacional"],
  ["/ajuda", "Ajuda"],
] as const;

export function PublicShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const pointerdown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setOpen(false);
    };
    const resize = () => {
      if (matchMedia("(min-width: 901px)").matches) setOpen(false);
    };
    document.addEventListener("keydown", keydown);
    document.addEventListener("pointerdown", pointerdown);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("pointerdown", pointerdown);
      window.removeEventListener("resize", resize);
    };
  }, [open]);
  return (
    <div className="wp-site">
      <a className="wp-skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="wp-header" ref={header}>
        <div className="wp-header-inner">
          <a href="/" className="wp-logo">
            <Globe2 size={29} strokeWidth={1.3} />
            <span>
              WALK<span>TALK</span>
              <small>COMUNICAÇÃO SEM FRONTEIRAS</small>
            </span>
          </a>
          <nav
            id="wp-navigation"
            aria-label="Navegação principal"
            className={open ? "wp-navigation is-open" : "wp-navigation"}
          >
            {navigation.map(([href, label]) => (
              <a
                key={href}
                href={href}
                aria-current={active === href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
            <a href="/portal" className="wp-mobile-portal">
              Acessar portal <ArrowUpRight size={15} />
            </a>
          </nav>
          <a href="/portal" className="wp-header-cta">
            Portal da empresa <ArrowUpRight size={15} />
          </a>
          <button
            ref={toggle}
            className="wp-menu"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="wp-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <footer className="wp-footer">
        <div className="wp-wrap wp-footer-grid">
          <div>
            <a className="wp-footer-brand" href="/">
              WALK<span>TALK</span>
            </a>
            <p>
              O mundo é grande.
              <br />
              Sua voz, maior.
            </p>
          </div>
          <div>
            <h2>Explore</h2>
            <a href="/produto">O aparelho</a>
            <a href="/solucoes">Para empresas</a>
            <a href="/saude">Saúde ocupacional</a>
          </div>
          <div>
            <h2>Seu espaço</h2>
            <a href="/portal">Portal da empresa</a>
            <a href="/ajuda">Central de ajuda</a>
            <a href="/privacidade">Privacidade e dados</a>
          </div>
          <div>
            <h2>O projeto</h2>
            <a href="/guia.html">Guia técnico</a>
            <a href="/walk-talk-source.zip" download>
              Código completo
            </a>
            <a href="/#jornada">Experiência interativa</a>
          </div>
        </div>
        <div className="wp-wrap wp-footer-bottom">
          <span>© {new Date().getFullYear()} WALK TALK</span>
          <span>Conceito de produto · Portal empresarial funcional</span>
          <span>PORTUGUÊS / BRASIL</span>
        </div>
      </footer>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
}) {
  return (
    <div className="wp-heading">
      <span className="wp-eyebrow">
        <i />
        {eyebrow}
      </span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

export function PortalCTA() {
  return (
    <section className="wp-wrap wp-cta">
      <div>
        <span className="wp-eyebrow">UM ESPAÇO PARA SUA EQUIPE</span>
        <h2>Organize o próximo passo.</h2>
        <p>
          Crie sua empresa e comece com equipes, aparelhos e canais de
          comunicação.
        </p>
      </div>
      <a className="wp-button" href="/portal">
        Acessar o portal <ArrowUpRight size={18} />
      </a>
    </section>
  );
}
