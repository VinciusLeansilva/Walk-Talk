"use client";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Download,
  LifeBuoy,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageHeading, PublicShell } from "./PublicShell";

const categories = [
  "Todos",
  "Primeiros passos",
  "Equipes e acesso",
  "Equipamentos",
  "Comunicação",
  "Aplicativo",
];
const questions = [
  {
    category: "Primeiros passos",
    question: "Como começar a usar o portal?",
    answer:
      "Abra o portal e entre com sua conta ChatGPT. Se ainda não fizer parte de uma empresa, preencha o cadastro inicial. Quem cria a empresa recebe o perfil de administrador. A opção de incluir equipes e aparelhos fictícios é desmarcada por padrão; deixe assim para começar com um ambiente vazio.",
    link: "/portal",
    label: "Abrir o portal",
  },
  {
    category: "Primeiros passos",
    question: "A apresentação transmite mensagens via satélite?",
    answer:
      "Não. O aparelho e o percurso da mensagem são uma demonstração conceitual e educativa. O PTT anima um envio e pode reproduzir sons sintetizados, sem gravar sua voz. As mensagens do portal são texto enviado pela internet, sem integração com aparelhos físicos.",
  },
  {
    category: "Primeiros passos",
    question: "A página de saúde guarda minhas informações?",
    answer:
      "A página de saúde ocupacional é apenas informativa. As marcações do roteiro ficam na memória da página e são apagadas ao recarregar. Não há prontuário, cadastro de sintomas, diagnóstico ou envio das marcações ao servidor.",
    link: "/saude",
    label: "Consultar orientações de saúde",
  },
  {
    category: "Equipes e acesso",
    question: "Como convidar pessoas para a empresa?",
    answer:
      "O administrador gera um convite nas configurações do portal e copia o link para compartilhar pelo canal que escolher. Cada convite vale por sete dias e pode ser usado uma vez. O convite também pode ser vinculado a um e-mail. O sistema não envia e-mails automaticamente. A pessoa convidada precisa, separadamente, ter acesso à hospedagem do site.",
  },
  {
    category: "Equipes e acesso",
    question: "Qual a diferença entre os três perfis?",
    answer:
      "O administrador gerencia convites, perfis, equipes e aparelhos. O gestor organiza equipes e aparelhos e acessa os canais da empresa. O colaborador consulta aparelhos próprios e da sua equipe, confere os atribuídos a si e acessa o canal Geral e o da sua equipe. As permissões são verificadas pelo servidor.",
    link: "/solucoes",
    label: "Conhecer os perfis",
  },
  {
    category: "Equipes e acesso",
    question: "Recebi um convite, mas não consigo abrir o site. O que faço?",
    answer:
      "O convite da empresa não libera o acesso à hospedagem. Peça ao proprietário do site para conferir seu acesso na plataforma de hospedagem. Depois, abra novamente o convite e entre com a conta correta. Se o convite venceu, foi revogado ou já foi usado, solicite um novo ao administrador.",
  },
  {
    category: "Equipamentos",
    question: "Como cadastrar e organizar um aparelho?",
    answer:
      "No portal, um administrador ou gestor pode abrir Equipamentos, criar um cadastro e associar equipe e responsável. A listagem permite buscar, filtrar por status, editar e arquivar aparelhos. Os registros são mantidos no banco da empresa; a tela não depende de dados fictícios.",
  },
  {
    category: "Equipamentos",
    question: "O que significa registrar uma conferência?",
    answer:
      "É um registro manual feito por uma pessoa. Ele não comprova conexão por satélite, bateria, localização ou funcionamento físico. Administradores e gestores podem conferir os aparelhos da empresa; colaboradores podem conferir somente aparelhos atribuídos a si.",
  },
  {
    category: "Equipamentos",
    question: "Posso exportar o inventário?",
    answer:
      "Sim. Use a ação de exportação em Equipamentos para baixar um arquivo CSV. O servidor inclui os registros que seu perfil tem permissão para consultar. O arquivo pode ser aberto em uma planilha; cuide do compartilhamento porque ele contém informações da operação.",
  },
  {
    category: "Comunicação",
    question: "Quem pode ler as mensagens dos canais?",
    answer:
      "O canal Geral é compartilhado pela empresa. Administradores e gestores acessam os canais da empresa; colaboradores acessam o Geral e o canal da própria equipe. As mensagens são armazenadas no servidor. Evite incluir dados clínicos ou outros conteúdos sensíveis em conversas coletivas.",
  },
  {
    category: "Comunicação",
    question: "As mensagens aparecem imediatamente?",
    answer:
      "Após o envio, a conversa é atualizada. Quando a página está visível, o portal consulta novas mensagens periodicamente, a cada 30 segundos. É necessária conexão com a internet. O portal não é um serviço de emergência e não deve substituir os canais oficiais da empresa para situações urgentes.",
  },
  {
    category: "Aplicativo",
    question: "Como instalar no celular ou computador?",
    answer:
      "Em navegadores compatíveis, use a opção Instalar aplicativo no menu ou na barra de endereço. No iPhone, abra no Safari, toque em Compartilhar e depois em Adicionar à Tela de Início. A instalação usa a tecnologia PWA, sem precisar de uma loja de aplicativos. As opções variam conforme o navegador.",
  },
  {
    category: "Aplicativo",
    question: "O portal funciona sem internet?",
    answer:
      "O portal, o login e as mensagens precisam de internet. Sem conexão, uma página orienta você a reconectar. O cache guarda apenas recursos públicos de instalação e da tela offline; ele não guarda contas, conversas, respostas da API ou páginas privadas.",
  },
  {
    category: "Aplicativo",
    question: "Como usar a demonstração pelo teclado?",
    answer:
      "Na página inicial, navegue com Tab até o PTT e segure Espaço ou Enter para simular a transmissão. Solte para enviar o pulso visual. O simulador também tem Anterior, Próximo e Reiniciar, e aceita as setas do teclado quando estiver em foco. O som começa desligado e pode ser ativado na navegação.",
    link: "/#ptt",
    label: "Abrir a demonstração",
  },
];
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export function HelpPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const results = useMemo(
    () =>
      questions.filter(
        (item) =>
          (category === "Todos" || category === item.category) &&
          normalize(`${item.question} ${item.answer}`).includes(
            normalize(search.trim()),
          ),
      ),
    [search, category],
  );
  const reset = () => {
    setSearch("");
    setCategory("Todos");
  };
  return (
    <PublicShell active="/ajuda">
      <section className="wp-wrap wp-intro wp-help-intro">
        <PageHeading
          eyebrow="WALK TALK / CENTRAL DE AJUDA"
          title={
            <>
              MENOS DÚVIDAS.
              <br />
              <em>MAIS CLAREZA.</em>
            </>
          }
          description="Encontre orientações para começar, organizar a equipe e aproveitar o portal no dia a dia."
        />
        <div className="wp-help-search">
          <Search size={22} />
          <label htmlFor="help-search" className="wp-sr-only">
            Buscar na central de ajuda
          </label>
          <input
            id="help-search"
            type="search"
            placeholder="Busque por convites, aparelhos, instalação…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setSearch("")}
            >
              <X size={19} />
            </button>
          )}
        </div>
        <p className="wp-search-hint">
          Experimente:{" "}
          <button
            onClick={() => {
              setCategory("Todos");
              setSearch("convite");
            }}
          >
            convite
          </button>
          <button
            onClick={() => {
              setCategory("Todos");
              setSearch("instalar");
            }}
          >
            instalar
          </button>
          <button
            onClick={() => {
              setCategory("Todos");
              setSearch("conferência");
            }}
          >
            conferência
          </button>
        </p>
      </section>
      <section
        className="wp-wrap wp-help-layout"
        aria-label="Perguntas frequentes"
      >
        <aside className="wp-help-sidebar">
          <h2>EXPLORE POR ASSUNTO</h2>
          <div
            className="wp-help-categories"
            role="group"
            aria-label="Filtrar por assunto"
          >
            {categories.map((item) => (
              <button
                key={item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
                <span>
                  {item === "Todos"
                    ? questions.length
                    : questions.filter((question) => question.category === item)
                        .length}
                </span>
              </button>
            ))}
          </div>
          <div className="wp-help-sidebar-note">
            <LifeBuoy size={23} />
            <h3>Precisa de acesso?</h3>
            <p>
              Procure o administrador da sua empresa ou o proprietário do site
              para questões de conta e permissões.
            </p>
          </div>
        </aside>
        <div className="wp-faq-results">
          <div className="wp-results-heading">
            <h2>{category === "Todos" ? "Perguntas frequentes" : category}</h2>
            <span role="status" aria-live="polite">
              {results.length}{" "}
              {results.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>
          {results.length > 0 ? (
            <div className="wp-faq-list">
              {results.map((item) => (
                <details key={item.question} className="wp-faq">
                  <summary>
                    <span>
                      <small>{item.category}</small>
                      {item.question}
                    </span>
                    <ChevronDown size={21} />
                  </summary>
                  <div>
                    <p>{item.answer}</p>
                    {item.link && (
                      <a className="wp-text-link" href={item.link}>
                        {item.label} <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="wp-help-empty">
              <Search size={34} />
              <h3>Nenhum resultado por aqui.</h3>
              <p>
                Tente outra palavra ou limpe os filtros para ver todos os
                assuntos.
              </p>
              <button className="wp-button" onClick={reset}>
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="wp-wrap wp-help-resources">
        <a href="/guia.html">
          <BookOpen />
          <div>
            <h2>Guia do projeto</h2>
            <p>Instalação, estrutura e hospedagem explicadas.</p>
          </div>
          <ArrowUpRight />
        </a>
        <a href="/privacidade">
          <ShieldCheck />
          <div>
            <h2>Privacidade e dados</h2>
            <p>Entenda o que o portal guarda e como usa.</p>
          </div>
          <ArrowUpRight />
        </a>
        <a href="/walk-talk-source.zip" download>
          <Download />
          <div>
            <h2>Código completo</h2>
            <p>Baixe o projeto para estudar e evoluir.</p>
          </div>
          <ArrowUpRight />
        </a>
      </section>
    </PublicShell>
  );
}
