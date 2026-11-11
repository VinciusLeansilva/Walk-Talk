import { ArrowUpRight, Code2, Globe2 } from "lucide-react";
import { Logo } from "./Navbar";
export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <div>
            <Logo />
            <p>O mundo é grande. Sua voz, maior.</p>
          </div>
          <nav className="footer-links" aria-label="Explorar WALK TALK">
            <a href="/produto">
              Produto <ArrowUpRight size={13} />
            </a>
            <a href="/solucoes">
              Empresas <ArrowUpRight size={13} />
            </a>
            <a href="/saude">
              Saúde ocupacional <ArrowUpRight size={13} />
            </a>
            <a href="/ajuda">
              Central de ajuda <ArrowUpRight size={13} />
            </a>
            <a href="/privacidade">
              Privacidade <ArrowUpRight size={13} />
            </a>
            <a href="/guia.html" target="_blank" rel="noreferrer">
              Guia do projeto <ArrowUpRight size={13} />
            </a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} WALK TALK. Todos os direitos
            reservados.
          </span>
          <span>
            <Globe2 size={12} /> PORTUGUÊS / BRASIL
          </span>
          <a href="/walk-talk-source.zip" download>
            Código-fonte <Code2 size={13} />
          </a>
        </div>
        <p className="demo-note">
          Experiência conceitual e educativa. O site simula o percurso de uma
          mensagem; não realiza chamadas via satélite, não grava áudio e não
          representa especificações comerciais verificadas.
        </p>
      </div>
    </footer>
  );
}
