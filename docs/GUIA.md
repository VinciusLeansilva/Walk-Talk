# WALK TALK — guia completo da versão 5

Todo o site usa modo escuro: páginas de apresentação, ajuda, privacidade, portal, saúde, formulários e diálogos.

Agora o projeto reúne a apresentação premium do aparelho, um portal empresarial com front-end e back-end e uma página informativa de saúde ocupacional. O portal usa banco de dados real. A cena de satélites e o PTT da apresentação continuam sendo demonstrações visuais.

## 1. Estrutura do projeto

```text
walk-talk/
├── app/                    # Rotas e layout do Vinext
│   ├── page.tsx            # Apresentação em /
│   ├── produto/page.tsx    # Produto
│   ├── solucoes/page.tsx   # Soluções para empresas
│   ├── ajuda/page.tsx      # Central de ajuda
│   ├── privacidade/page.tsx # Dados e privacidade
│   ├── not-found.tsx      # Página 404 com navegação
│   ├── portal/page.tsx     # Portal em /portal
│   └── saude/page.tsx      # Informação em /saude
├── src/
│   ├── website/              # Páginas institucionais e navegação compartilhada
│   ├── portal/             # Dashboard, equipamentos, equipes, mensagens, saúde
│   ├── components/         # Produto, navegação, PTT, globo, PWA
│   ├── sections/           # Hero, jornada, mapa, benefícios, expedição
│   ├── hooks/              # Áudio, rolagem, instalação e animações
│   └── store/              # Zustand da experiência do produto
├── server/
│   ├── api.ts              # Rotas, validação, autorização e SQL
│   ├── types.ts            # Contratos compartilhados com o cliente
│   ├── d1.ts               # Contrato do banco
│   └── api.test.ts         # Testes com SQLite real
├── worker/index.ts         # Entrada de produção: API e renderização web
├── db/schema.ts            # Tabelas e índices Drizzle
├── drizzle/                # Migrações SQL e metadados versionados
├── public/                 # Imagens locais, manifest, SW, offline e guia
├── scripts/                # Preview, migração local e empacotamento
├── tests/                  # Testes de navegador
├── docs/                   # Arquitetura, API, validação e guia legado
└── .openai/hosting.json    # Identidade do Site e binding lógico DB
```

## 2. Instalar e rodar no computador

Instale Node.js 24 LTS. Extraia o ZIP, abra um terminal na pasta do projeto e execute:

```bash
npm ci
npm run build
npm run db:local
npm run dev
```

Abra o endereço exibido pelo terminal, normalmente http://localhost:5173. A migração inicial já está incluída. O banco local é criado em `.wrangler/state`, que não faz parte do código distribuído.

No portal, clique em “Entrar com ChatGPT”. O plugin oficial Sites fornece uma identidade de desenvolvimento local chamada Seedy. Essa simulação só existe em desenvolvimento local e não entra no build de produção. Na hospedagem, a autenticação é feita pela plataforma Sites.

Crie sua empresa pelo formulário. A caixa “Incluir equipes e aparelhos fictícios” é opcional e começa desmarcada. Sem ela, seu ambiente inicia vazio. Com ela, três aparelhos e duas equipes de exemplo são criados com identificação explícita.

Para testar a compilação final:

```bash
npm run build
npm run db:local
npm start
```

O preview compilado usa http://127.0.0.1:4173 e não fornece o login simulado. Use o modo `npm run dev` para explorar manualmente com identidade local. Os testes automatizados podem fornecer identidades de teste ao emulador compilado; não exponha esse mecanismo como autenticação pública.

Se estivesse criando apenas a apresentação original do zero, o comando de entrada seria `npm create vite@latest walk-talk -- --template react-ts`. Esta entrega já contém a integração full stack, as dependências e o lockfile: use `npm ci` para reproduzi-la, em vez de recriar o template.

## 3. Como o front-end funciona

`app/layout.tsx` define idioma, fontes, metadata SEO, ícones, manifesto e registro da PWA. As páginas selecionam os componentes da apresentação, do portal e da saúde.

`PortalApp.tsx` consulta `/api/v1/session` ao abrir. Enquanto espera, mostra carregamento; quando falta identidade, oferece login; quando falta empresa, mostra o cadastro inicial; quando existe associação, abre a navegação adequada ao perfil. A escolha de página aparece no fragmento da URL, permitindo abrir diretamente `/portal#devices` ou `/portal#health`.

`api.ts` concentra fetch, erros legíveis, cancelamento com AbortController e atualização dos dados. Se uma solicitação falha, os formulários preservam o texto para permitir nova tentativa. `ui.tsx` contém componentes reutilizáveis e o modal nativo `dialog`, com foco, Escape e retorno ao acionador.

O dashboard usa números retornados pelo servidor. Não há números aleatórios para aparentar uma empresa ativa. Equipamentos têm busca, filtro de status, edição, conferência manual, arquivamento e exportação. A conversa aceita somente texto: React escapa o conteúdo, inclusive quando alguém digita uma tag HTML.

A saúde ocupacional é uma página de leitura. Os cartões e as perguntas se expandem; a busca filtra temas; as marcações do roteiro ficam apenas no estado React. Recarregar limpa as marcações. Não há API, tabela, histórico, diagnóstico ou prontuário de saúde.

As novas rotas `/produto`, `/solucoes`, `/ajuda` e `/privacidade` usam uma navegação compartilhada. A central de ajuda filtra perguntas por busca e categoria; Soluções apresenta fluxos por setor em abas acessíveis. Não existe envio de formulário de suporte nem atendimento fictício. Todas as páginas possuem título próprio e funcionam com link direto.

## 4. Como o back-end funciona

O Worker recebe cada requisição. Endereços `/api/v1/*` entram no handler TypeScript de `server/api.ts`; os demais seguem para o renderizador Vinext. O banco é acessado pelo binding `DB` fornecido pela hospedagem.

Primeiro o servidor identifica a pessoa pelos cabeçalhos autenticados Sites. Depois busca sua associação à empresa e verifica o perfil para a operação solicitada. Todas as consultas são limitadas à empresa; canais e aparelhos têm restrições adicionais para colaboradores. Não basta modificar o JavaScript ou enviar `role: "admin"` em um formulário: a autorização é decidida no servidor.

O D1 armazena empresas, pessoas, equipes, aparelhos, mensagens, convites e atividades. SQL usa parâmetros; operações relacionadas usam batches transacionais. Os convites têm hash no banco, prazo de sete dias e aceitação única. Nenhum e-mail é enviado pelo projeto: o administrador copia o link e o compartilha pelo canal que escolher.

O perfil do aplicativo e o acesso à hospedagem são controles diferentes. Um convidado também precisa ser autorizado a acessar o Site. A versão atual mantém a audiência privada do projeto; o administrador controla o compartilhamento na plataforma quando for incluir outras pessoas.

Consulte `docs/API.md` para rotas e corpos de exemplo e `docs/ARQUITETURA.md` para a matriz de permissões e limites de listagem.

## 5. A experiência original do aparelho

A apresentação foi preservada. Zustand compartilha passo atual, PTT pressionado, som, modo detalhado e progresso da jornada. Soltar o PTT incrementa um pulso, que anima o envio ao satélite. O feedback passa de preparação para trânsito e recebimento; os 2,4 segundos são uma duração visual, não latência real.

Three.js/React Three Fiber desenham a Terra, satélites, linhas e pulso. A cena é carregada sob demanda, usa limite de renderização e tem alternativa leve. GSAP ScrollTrigger relaciona rolagem às seis etapas; Lenis suaviza rolagem no desktop quando a preferência de movimento permite. Framer Motion cuida das transições e microinterações.

Web Audio sintetiza clique, bipe e ruído de rádio. O som inicia desligado e só é desbloqueado após uma interação. O botão PTT aceita mouse, toque, Espaço e Enter, encerrando a pressão quando o gesto é cancelado ou a janela perde foco. Nenhuma voz é capturada ou enviada.

A descrição detalhada da landing anterior continua em `docs/GUIA-LANDING-V3.md`, como referência histórica. Comandos de build, hospedagem e cache daquela versão estática foram substituídos pelas orientações deste guia.

## 6. Como testar

```bash
npm run typecheck
npm run test:api
npm run build
npm run db:local
npm test
```

Os testes de API usam SQLite e a migração real. Cobrem identidade, separação de empresas, permissões, origem da escrita, validações, convites, arquivos CSV e concorrência em alterações.

Os testes de navegador usam Chromium. Se necessário no seu computador, execute `npx playwright install chromium`. No ambiente entregue, o Chromium do sistema também é aceito. Os testes não usam banco de produção nem enviam convites ou mensagens a pessoas reais.

Teste manual recomendado:

1. Entre no modo de desenvolvimento e crie uma empresa.
2. Cadastre uma equipe e um aparelho. Recarregue: o registro deve continuar lá.
3. Edite status/responsável, registre a conferência e exporte CSV.
4. Abra Comunicação, publique uma mensagem e recarregue.
5. Como administrador, gere um convite. Em outra conta autorizada à hospedagem, aceite-o e confira as restrições do perfil.
6. Abra Saúde ocupacional, filtre um tema, expanda orientações e marque o roteiro. Recarregue e confirme que as marcações não foram salvas.
7. Na apresentação, teste o PTT, o som, as seis etapas, o mapa, os cenários e a navegação por teclado.
8. Em Soluções, percorra as abas com setas, Home e End. Em Ajuda, combine assunto e busca, abra uma resposta e teste uma palavra sem resultados.
9. Abra as quatro páginas novas diretamente pelo endereço e confira os menus em celular e desktop. Acesse um endereço inexistente para testar a página 404.

## 7. Hospedar com back-end e banco

Hospedagem utilizada: **Sites**, com HTTPS, Worker e banco D1 provisionados pela plataforma. Endereço atual: https://walk-talk-orbital-1028.vinicius-silva205.chatgpt.site. O acesso privado da versão anterior foi mantido. Ao incluir pessoas, autorize-as também no compartilhamento da hospedagem e depois utilize os convites do aplicativo.

Esta versão não é mais uma pasta estática independente. Subir apenas `dist/client` em uma hospedagem estática não executa autenticação, API ou banco. É necessário um ambiente compatível com Cloudflare Workers e D1.

Na hospedagem Sites, `.openai/hosting.json` declara `d1: "DB"` e preserva o identificador existente do projeto. O plugin oficial `@openai/sites-vite-plugin` inclui manifesto e migrações no artefato. A publicação envia o Worker, os módulos, os assets e aplica as migrações ao D1 hospedado. O banco local é separado: os dados de testes não são publicados.

O ZIP contém um manifesto portável somente com os bindings, sem o identificador do Site desta conversa. Isso permite compilar localmente e criar sua própria hospedagem sem sobrescrever este projeto. Registre seu próprio Site ou configure seu ambiente no provedor antes de publicar.

Para domínio próprio, configure o domínio na hospedagem, mantenha HTTPS e atualize `metadataBase` em `app/layout.tsx`. O login precisa continuar passando pela infraestrutura que autentica e injeta a identidade.

Se optar por Cloudflare fora de Sites, crie seu próprio D1, configure o binding DB, aplique as migrações e substitua a camada de identidade por uma integração verificada, por exemplo Cloudflare Access com validação server-side. Nunca aceite diretamente do navegador os cabeçalhos `oai-authenticated-user-*`: essa confiança só é válida atrás da plataforma Sites. Não há um login autônomo por senha incluído no projeto.

### E se eu quiser Render?

Render é uma alternativa possível após uma migração técnica. Esta entrega executa em Cloudflare Workers com D1 e identidade Sites; não é um servidor Express/Node independente. Para Render, seria preciso adaptar o ponto de entrada HTTP, substituir o binding D1 por um banco como PostgreSQL, portar o schema/SQL, adicionar login com sessões verificadas e configurar variáveis no provedor. Não há um `render.yaml` que resolva essas diferenças sozinho. A hospedagem Sites já publicada mantém o back-end e o banco funcionais sem essa migração.

Migrações futuras:

```bash
# Depois de editar db/schema.ts
npm run db:generate
npm run build
npm run db:local
```

Revise e versione o SQL e os metadados. Nunca altere uma migração já aplicada em produção; acrescente uma nova. Gerenciar backups e retenção faz parte da operação da empresa no provedor.

## 8. PWA e instalação

`public/manifest.json` define nome, ícones e abertura em `/portal`. `public/sw.js` atualiza o cache público e remove caches antigos da apresentação estática. O portal depende de internet; contas, conversas, respostas da API e HTML privado nunca são cacheados. Sem conexão, a aplicação apresenta uma página de reconexão.

Chrome e Edge oferecem instalação pelo navegador. No iPhone, use Safari → Compartilhar → Adicionar à Tela de Início. Instalação física e giroscópio ainda devem ser conferidos no dispositivo de destino.

Tauri ou Electron podem envolver uma versão web hospedada, mas isso exige configurar origem, login e navegação corretamente. O back-end continua hospedado. A entrega inclui web/PWA; não inclui binários desktop. Em Electron, mantenha `nodeIntegration: false`, `contextIsolation: true` e sandbox habilitado. Consulte as instruções históricas em `docs/GUIA-LANDING-V3.md` apenas como referência inicial.

## 9. Conteúdo de saúde e manutenção

LER/DORT e ergonomia são apresentados com referências do Ministério da Saúde, Ministério do Trabalho e Emprego e Fundacentro, consultadas em 04/11/2026. Os links ficam na própria página. O conteúdo não é diagnóstico, tratamento ou certificado de atendimento à NR-17. Pausas dependem da atividade e da avaliação aplicável; não se impõe um intervalo universal.

Imagens do aparelho e da expedição são conceitos gerados por IA. Texturas da Terra, fontes e mapa mantêm as atribuições no guia da landing. O projeto não demonstra uma rede satelital real nem confirma especificações de um equipamento comercial.

Para atualizar os arquivos de download depois de editar o código:

```bash
python scripts/package-guide.py
npm run build
```

O gerador produz `public/guia.html` com todos os arquivos de texto escapados e `public/walk-talk-source.zip` com código, migrações e assets. Exclui dependências, Git, dados de emulação, credenciais e caches. A compilação final deve ser feita depois para incluir o guia atualizado na hospedagem.
