import { ArrowLeft, ArrowUpRight, Globe2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="wt-not-found">
      <a className="wt-error-brand" href="/" aria-label="WALK TALK — início">
        <Globe2 size={26} /> WALK<span>TALK</span>
      </a>
      <div className="wt-error-orbit" aria-hidden="true">404</div>
      <span className="eyebrow">COORDENADAS NÃO ENCONTRADAS</span>
      <h1>Vamos encontrar<br />o seu caminho.</h1>
      <p>Esta página não está neste endereço. Volte à experiência WALK TALK ou consulte a central de ajuda.</p>
      <nav aria-label="Continuar navegando">
        <a href="/"><ArrowLeft size={17} /> Voltar ao início</a>
        <a href="/ajuda">Central de ajuda <ArrowUpRight size={17} /></a>
      </nav>
    </main>
  );
}
