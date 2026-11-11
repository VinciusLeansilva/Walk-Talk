import {
  ArrowUpRight,
  Database,
  Fingerprint,
  LockKeyhole,
  MicOff,
  ShieldCheck,
} from "lucide-react";
import { PageHeading, PublicShell } from "./PublicShell";

const contents = [
  ["identidade", "Identidade e acesso"],
  ["dados", "Dados do portal"],
  ["saude", "Saúde e áudio"],
  ["armazenamento", "Armazenamento local"],
  ["controle", "Controle das informações"],
] as const;

export function PrivacyPage() {
  return (
    <PublicShell active="/privacidade">
      <section className="wp-wrap wp-intro wp-privacy-intro">
        <PageHeading
          eyebrow="WALK TALK / PRIVACIDADE E DADOS"
          title={
            <>
              TRANSPARÊNCIA
              <br />
              <em>EM CADA CONEXÃO.</em>
            </>
          }
          description="Entenda quais informações fazem parte do portal e como os recursos desta versão funcionam. Informação clara para usar a plataforma com consciência."
        />
        <p className="wp-privacy-version">
          <ShieldCheck size={16} /> Referência da implementação · novembro de
          2026
        </p>
      </section>
      <section
        className="wp-wrap wp-privacy-highlights"
        aria-label="Visão geral de privacidade"
      >
        <div>
          <Fingerprint />
          <strong>Identidade autenticada</strong>
          <span>Acesso pela plataforma Sites e sua conta ChatGPT.</span>
        </div>
        <div>
          <Database />
          <strong>Dados da sua operação</strong>
          <span>Registros da empresa com permissões por perfil.</span>
        </div>
        <div>
          <MicOff />
          <strong>PTT sem gravação</strong>
          <span>A demonstração usa animações e sons sintetizados.</span>
        </div>
      </section>
      <div className="wp-wrap wp-policy-layout">
        <aside className="wp-policy-nav">
          <h2>NESTA PÁGINA</h2>
          <nav aria-label="Seções de privacidade">
            {contents.map(([id, label]) => (
              <a href={`#${id}`} key={id}>
                {label}
                <ArrowUpRight size={14} />
              </a>
            ))}
          </nav>
          <div>
            <LockKeyhole size={23} />
            <p>
              Esta página descreve a implementação atual. As políticas da
              empresa e da hospedagem também se aplicam ao uso.
            </p>
          </div>
        </aside>
        <div className="wp-policy-copy">
          <section id="identidade">
            <span className="wp-eyebrow">01 / ACESSO</span>
            <h2>Uma conta, um contexto de empresa.</h2>
            <p>
              O login é feito com a identidade ChatGPT fornecida pela plataforma
              Sites. O aplicativo usa a identificação autenticada e as
              informações de perfil disponibilizadas, como nome e e-mail, para
              reconhecer a pessoa e associá-la à empresa. O projeto não tem
              cadastro próprio de senha.
            </p>
            <p>
              O acesso à hospedagem e os perfis do portal são controles
              diferentes. A publicação atual mantém o site privado. Um convite
              para a empresa não altera a permissão de abrir o site: o
              proprietário precisa autorizar esse acesso na hospedagem.
            </p>
            <p>
              Administradores, gestores e colaboradores têm permissões
              diferentes, verificadas pelo servidor. Os registros são limitados
              à empresa; mensagens e aparelhos têm restrições adicionais
              conforme o perfil e a equipe.
            </p>
          </section>
          <section id="dados">
            <span className="wp-eyebrow">02 / INFORMAÇÕES PERSISTIDAS</span>
            <h2>O que o portal armazena.</h2>
            <p>
              O banco D1, usado pelo back-end hospedado em Cloudflare Workers
              por meio do Sites, mantém os registros necessários às funções do
              portal:
            </p>
            <dl>
              <div>
                <dt>Empresa e pessoas</dt>
                <dd>
                  Nome da empresa, membros, identificação da conta, perfil de
                  acesso e vínculos com equipes.
                </dd>
              </div>
              <div>
                <dt>Equipes e aparelhos</dt>
                <dd>
                  Cadastros, identificação, status informado, atribuições e
                  conferências manuais dos equipamentos.
                </dd>
              </div>
              <div>
                <dt>Comunicação</dt>
                <dd>
                  Textos publicados nos canais, autoria, canal e data. As
                  mensagens não são transmissões por satélite.
                </dd>
              </div>
              <div>
                <dt>Convites e atividades</dt>
                <dd>
                  Condições, validade e uso dos convites, além dos registros de
                  atividade da operação. O código do convite é armazenado como
                  hash; o link original aparece ao gerar.
                </dd>
              </div>
            </dl>
            <p>
              As mensagens são compartilhadas com as pessoas autorizadas no
              canal. Não envie dados clínicos ou outros conteúdos sensíveis para
              conversas coletivas. Exportações CSV passam a ser arquivos sob
              responsabilidade de quem os baixa.
            </p>
          </section>
          <section id="saude">
            <span className="wp-eyebrow">03 / CONTEÚDO EDUCATIVO</span>
            <h2>Saúde informativa. Áudio simulado.</h2>
            <p>
              A página de saúde ocupacional contém orientações gerais sobre
              LER/DORT e ergonomia. Ela não coleta sintomas, não mantém
              prontuários e não produz diagnósticos. As marcações do roteiro de
              observação ficam somente na memória da página; recarregar apaga as
              escolhas.
            </p>
            <p>
              O PTT da apresentação não solicita o microfone, não grava voz e
              não envia áudio. Cliques, bipes e ruído de rádio são gerados no
              navegador e começam desligados. O aparelho, os satélites e o
              percurso da mensagem são uma simulação conceitual.
            </p>
            <a className="wp-text-link" href="/saude">
              Consultar a página de saúde <ArrowUpRight size={16} />
            </a>
          </section>
          <section id="armazenamento">
            <span className="wp-eyebrow">04 / NAVEGADOR E INSTALAÇÃO</span>
            <h2>O que fica no seu dispositivo.</h2>
            <p>
              A instalação como PWA usa um service worker. O cache da aplicação
              guarda apenas recursos públicos, como ícones e a tela de
              reconexão. Contas, conversas, respostas da API e páginas privadas
              não são armazenadas nesse cache.
            </p>
            <p>
              O portal depende de internet. Ao sair da conexão, você recebe uma
              orientação para reconectar. O projeto não inclui ferramentas de
              publicidade ou rastreamento de marketing. A plataforma de
              hospedagem e autenticação pode utilizar mecanismos próprios de
              sessão e registros operacionais, sujeitos às políticas desses
              serviços.
            </p>
          </section>
          <section id="controle">
            <span className="wp-eyebrow">05 / CUIDADO COM AS INFORMAÇÕES</span>
            <h2>Responsabilidades e solicitações.</h2>
            <p>
              A empresa é responsável por definir quem participa do seu espaço,
              revisar perfis e compartilhar informações de maneira adequada. O
              proprietário do site controla o acesso à hospedagem. Evite
              compartilhar links de convite fora do público pretendido.
            </p>
            <p>
              Para dúvidas sobre seus dados, correção, acesso ou solicitação de
              exclusão, procure o administrador da empresa ou o responsável pela
              implantação. Esta versão não inclui um fluxo automático de
              exclusão de conta ou uma política automática de retenção. A
              empresa deve definir esses procedimentos e a gestão de backups com
              o provedor.
            </p>
            <p>
              A página descreve o comportamento técnico disponível; ela não
              substitui a política de privacidade da organização nem uma
              avaliação jurídica específica para a implantação.
            </p>
            <a className="wp-text-link" href="/ajuda">
              Consultar a central de ajuda <ArrowUpRight size={16} />
            </a>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
