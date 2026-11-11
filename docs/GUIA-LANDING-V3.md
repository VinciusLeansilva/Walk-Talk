# WALK TALK — Guia do projeto

Versão 3 de uma landing page React + Vite + TypeScript com uma experiência de comunicação orbital e exploração em campo. O PTT agora mostra o caminho completo da mensagem simulada, o aparelho oferece dois cenários e uma nova seção apresenta momentos de uma expedição. Todo o código está incluído neste projeto, organizado por responsabilidade. A versão HTML deste guia também apresenta o código-fonte completo, arquivo por arquivo.

## 1. Executar o projeto entregue

Requisitos: Node.js 22.12+ (recomendado Node 24 LTS), npm e um navegador moderno. Abra o terminal na pasta descompactada:

```bash
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente http://localhost:5173. `npm ci` instala exatamente as versões do `package-lock.json`; não use versões diferentes ao reproduzir o projeto.

Para gerar e conferir a versão de produção:

```bash
npm run build
npm run preview
```

`npm run build` valida o TypeScript, gera `dist` e pré-renderiza a primeira tela em HTML estático. `scripts/prerender.mjs` também atualiza a revisão desse HTML no service worker. O preview normalmente usa http://localhost:4173. O service worker é gerado no build de produção, não no servidor de desenvolvimento.

## 2. Criar a estrutura do zero

Estes comandos documentam a criação inicial. Não é necessário rodá-los dentro da pasta do projeto já entregue:

```bash
npm create vite@latest walk-talk -- --template react-ts
cd walk-talk
npm install three @react-three/fiber framer-motion gsap lenis zustand lucide-react
npm install @fontsource/space-grotesk @fontsource/inter
npm install -D tailwindcss @tailwindcss/vite @types/three vite-plugin-pwa
npm install -D @playwright/test @axe-core/playwright prettier lighthouse
npm run dev
```

Depois, substitua os arquivos do template pelos arquivos entregues. Tailwind 4 usa o plugin `@tailwindcss/vite` e `@import 'tailwindcss'`. Esta configuração não exige `tailwind.config.js` nem PostCSS separado.

## 3. Estrutura de pastas

```text
walk-talk/
├── public/
│   ├── favicon.svg
│   ├── icons/                   # PNG 192, 512 e maskable
│   ├── product/                 # Imagem conceitual em WebP, 2 tamanhos
│   ├── landscapes/              # Paisagem ilustrativa local em WebP
│   ├── textures/                # Terra diurna e noturna locais
│   ├── og-cover.png             # Imagem para compartilhamento
│   ├── guia.html                # Guia + fonte completo, gerados
│   └── walk-talk-source.zip     # Download do projeto, gerado
├── src/
│   ├── assets/
│   │   ├── content.ts           # Passos, benefícios e cidades
│   │   └── world-paths.json     # Geometria SVG do mapa
│   ├── components/
│   │   ├── DeferredSection.tsx # Carregamento progressivo por seção
│   │   ├── ProductStage.tsx    # Aparelho, pontos e cenários Órbita/Expedição
│   │   ├── Navbar.tsx          # Navegação ativa, som, progresso
│   │   ├── Globe.tsx           # Lazy load, detecção e fallback
│   │   ├── EarthScene.tsx      # Canvas, Terra, órbitas e satélites
│   │   ├── PTTButton.tsx       # Controle pressionar/soltar
│   │   ├── TransmissionFeedback.tsx # Caminho e recebimento simulados
│   │   ├── transmission-feedback.css # Estilos do acompanhamento do PTT
│   │   ├── Cursor.tsx          # Cursor adicional para mouse
│   │   └── Footer.tsx          # Links e informações do conceito
│   ├── hooks/
│   │   ├── usePlayback.ts     # Reprodução/pause das seis etapas
│   │   ├── useAudio.ts         # Sons sintetizados com Web Audio
│   │   ├── useExperienceEffects.ts # Lenis, mídia e ScrollTrigger
│   │   ├── useParallax.ts      # Sensor de orientação opcional
│   │   └── useInstall.ts       # Instalação PWA e instruções iOS
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── FieldExperience.tsx # Momentos da expedição em abas acessíveis
│   │   ├── field-experience.css # Paisagem, conversa e abas responsivas
│   │   ├── Journey.tsx
│   │   ├── Coverage.tsx
│   │   └── Benefits.tsx
│   ├── store/useExperience.ts  # Estado compartilhado com Zustand
│   ├── App.tsx                # Composição das seções
│   ├── main.tsx               # Entrada, fontes e CSS
│   └── index.css              # Design, responsividade, animações
├── docs/GUIA.md
├── scripts/prerender.mjs      # HTML inicial estático no build
├── scripts/package-guide.py   # Gera guia HTML e ZIP
├── tests/experience.spec.ts    # Testes de navegador
├── tests/upgrade.spec.ts       # Novos fluxos de PTT, produto e expedição
├── playwright.config.ts
├── vite.config.ts             # React, Tailwind, PWA e build
├── index.html                 # SEO e ponto de montagem
├── tsconfig*.json             # TypeScript estrito
├── package.json
└── package-lock.json
```

## 4. Como funciona — explicação de professor

### React e responsabilidades

Pense em cada componente como uma peça de interface com uma responsabilidade clara. `App.tsx` reúne as seções; `Navbar` gerencia a navegação; `PTTButton` trata os gestos de transmissão; `Coverage` escolhe as cidades. Os textos vivem em `content.ts`, separados do layout: você pode alterar a mensagem comercial sem reescrever animações.

No build, React gera o HTML inicial e, no navegador, `hydrateRoot` conecta os eventos a esse HTML. Em desenvolvimento, `createRoot` monta a interface normalmente. Assim o visitante já vê a primeira tela antes de terminar o JavaScript.

A página não precisa de servidor de aplicação, banco de dados ou chave de API. Todos os assets são servidos pelo próprio domínio. Isso simplifica a hospedagem e possibilita a experiência offline após o primeiro acesso completo.

### Zustand: uma única fonte de estado

`useExperience.ts` contém:

- `step`: etapa atual, limitada entre 0 e 5;
- `ptt`: se o botão está pressionado;
- `sound`: liga ou silencia o áudio; começa `false`;
- `detailed`: troca o texto resumido pelo detalhado;
- `pulse`: contador incrementado uma vez a cada liberação de um PTT ativo;
- `journey`: progresso contínuo da seção, entre 0 e 1;
- `manual`: preserva uma etapa escolhida nos controles até o próximo gesto de rolagem do usuário.

Cada componente assina somente o pedaço de estado necessário, por exemplo `useExperience(s => s.ptt)`. Assim, mudar o detalhe de um texto não exige que toda a página atualize por causa de uma assinatura global. Dentro de `useFrame`, a cena lê `getState()` para consultar valores atualizados sem re-renderizar React a cada quadro.

### Three.js e React Three Fiber

`Canvas` fornece o renderizador WebGL. A Terra é uma esfera com textura diurna e uma textura emissiva para as luzes noturnas. Um shader transparente produz o brilho na borda da atmosfera. Órbitas são toros finos; os satélites combinam pequenas caixas para corpo e painéis. O sinal segue uma curva Catmull–Rom: ela fornece tanto a linha desenhada quanto a posição do pacote luminoso.

`useFrame` atualiza rotação, satélites, pulso e câmera usando o delta de tempo. Isso evita velocidades diferentes em monitores de 60 e 120 Hz. O parallax usa o ponteiro; no celular, o controle de movimento solicita permissão de orientação quando o navegador exige.

`React.lazy` separa a cena em outro arquivo JavaScript. `DeferredSection` carrega expedição, jornada, mapa e benefícios quando se aproximam da tela; âncoras estáveis permitem ir diretamente a essas seções. O fallback CSS aparece durante o carregamento. `IntersectionObserver` desmonta cenas distantes da tela. A cena recebe um orçamento de 30 quadros por segundo e o DPR é limitado a 1,25 para diminuir o trabalho da GPU. A renderização pausa quando a aba está oculta. A criação do Canvas é adiada em 700 ms, e a esfera CSS usa uma textura WebP menor durante o carregamento. Em aparelhos móveis com poucos núcleos/memória, economia de dados, ausência de WebGL2 ou preferência de movimento reduzido, a versão leve usa uma esfera CSS texturizada. O restante da página continua interativo.

### ScrollTrigger, Lenis e Framer Motion

Lenis suaviza a rolagem de mouse e é alimentado pelo ticker do GSAP. Dispositivos de toque mantêm sua rolagem inercial nativa. O código de ScrollTrigger só carrega quando a seção se aproxima da tela; um único trigger acompanha o progresso, atualiza `journey` e distribui `step` entre as seis fases, evitando várias medições iniciais de layout. A cena do simulador usa esses valores para mover a câmera e o pacote da mensagem entre origem, órbita e destino. Os botões permitem explorar a mesma sequência manualmente.

Framer Motion controla transições, a troca do card atual e a abertura dos benefícios. O hero já aparece no HTML inicial, sem esperar uma animação de opacidade para exibir seu conteúdo. `MotionConfig reducedMotion="user"` respeita a preferência do usuário. O CSS e o hook de rolagem também desativam movimentos quando `prefers-reduced-motion` está ativo. Os triggers de estado permanecem, pois não dependem de animação.

### PTT robusto para mouse, toque e teclado

No `pointerdown`, o botão captura o ponteiro e define `ptt=true`. A captura permite soltar o dedo ou mouse fora do botão sem perder o evento. Ao liberar, `ptt=false` e `pulse` aumenta. A referência `held` impede envios duplicados.

A tecla Espaço funciona na página e Espaço/Enter funcionam com o botão focado. O atalho global ignora inputs, links e outros botões para não interferir na navegação normal. Cancelamento do gesto, perda da captura, saída do foco da janela e mudança de aba liberam o botão: a interface não fica presa em “Transmitindo”.

Esta versão não solicita microfone: a onda é uma visualização sintética. Não grava nem transmite voz. Para uma futura onda real, solicite `getUserMedia({audio:true})` somente após uma ação explícita, conecte o stream a um `AnalyserNode`, calcule a amplitude e pare todas as tracks ao desligar. Esse recurso é opcional e não é necessário para o simulador entregue.

### Acompanhar o sinal com `TransmissionFeedback`

O botão e a visualização têm responsabilidades diferentes: `PTTButton` reconhece o gesto, enquanto `TransmissionFeedback` mostra o resultado desse gesto. Ambos consultam o mesmo estado Zustand, sem criar um segundo botão ou duplicar os atalhos de teclado. A visualização assina apenas `ptt` e `pulse`; o número da última mensagem concluída, `completedPulse`, fica no estado local do componente.

A lógica segue quatro situações. Antes da primeira interação, a mensagem é “Pronto para conectar”. Com `ptt=true`, aparece “Preparando sua mensagem”. Ao soltar, `pulse` aumenta e fica maior que `completedPulse`: o estado passa a “Sinal em trânsito”. Um `setTimeout` de 2.400 ms atualiza `completedPulse` para o número desse envio, exibindo “Mensagem recebida”. Esse intervalo serve apenas para contar a história visualmente; não é uma medição nem promessa de latência de uma rede satelital.

O timer é criado dentro de `useEffect` e cancelado no retorno de limpeza. Uma nova pressão ou a desmontagem do componente cancela a conclusão pendente. Assim, uma mensagem antiga não deve concluir por cima de uma interação nova. Os três nós — seu aparelho, satélite e destinatário — ajudam a entender o percurso. O texto de status usa `aria-live="polite"`; com movimento reduzido, os pulsos animados viram linhas estáticas, e o progresso continua disponível em texto. O aviso informa que nenhuma voz é gravada ou enviada.

### Web Audio API

Não há arquivos de som para baixar. Um oscilador cria o clique e o bipe; um buffer de ruído passa por um filtro passa-faixa para lembrar um rádio. Um `GainNode` controla o volume. O `AudioContext` é criado e retomado após interação do usuário, respeitando as políticas de autoplay. Ao silenciar, os nós são desconectados e o ruído para. O som começa desligado em cada carregamento.

### Produto explorável e reprodução da jornada

A imagem conceitual do aparelho foi criada para este projeto e possui dois tamanhos WebP para reduzir o download no celular. `ProductStage` mantém localmente qual ponto está aberto: antena, comando PTT ou retorno do áudio. Todos são botões com estado expandido e controle de fechamento. Os detalhes oferecem uma ação contextual para experimentar o PTT ou acompanhar a jornada. Escape e o botão de fechar devolvem o foco ao ponto que abriu a explicação, para que a pessoa continue navegando pelo teclado.

Na versão 3, o estado local `scene` também escolhe entre Órbita e Expedição. Os dois botões usam `aria-pressed` dentro de um grupo com nome acessível. Órbita monta o globo; Expedição substitui esse fundo por uma paisagem WebP local. A imagem do produto continua em primeiro plano. A paisagem é decorativa nessa composição, por isso seu `alt` é vazio; a imagem principal do aparelho mantém a descrição. A escolha não altera o produto nem significa que existam modelos comerciais diferentes.

`usePlayback` avança as seis etapas a cada 2,8 segundos. Ele para quando a aba fica oculta, quando o simulador sai da tela, quando a sequência termina ou quando você escolhe uma etapa manualmente. A reprodução só começa ao apertar o botão correspondente; ela não captura áudio.

### Expedição e abas acessíveis

`FieldExperience` apresenta a partida, a travessia e o reencontro. Cada momento contém uma mensagem e uma descrição ilustrativas, definidas no próprio componente. `moment` guarda somente o índice selecionado; esse estado é local porque nenhuma outra seção depende dele. A troca usa uma transição curta de opacidade com Framer Motion, respeitando a configuração de movimento reduzido da aplicação.

As abas usam `role="tablist"`, `role="tab"`, `aria-selected` e `aria-controls`; o conteúdo tem `role="tabpanel"` e identifica sua aba com `aria-labelledby`. Apenas a aba selecionada tem `tabIndex={0}`; as demais usam `-1`. Essa técnica, chamada de foco móvel ou *roving tabindex*, permite entrar no conjunto com Tab e navegar entre as opções com as setas. O array de referências `tabs` permite focar a nova aba após a seleção. Direita e esquerda percorrem os três momentos em ciclo; Home vai ao primeiro e End ao último. Clique e toque também funcionam.

O link “Experimente o PTT” leva a `#ptt`, o mesmo botão usado no hero. A paisagem e as mensagens estão identificadas como ilustrativas. A imagem foi gerada por IA e é servida pelo próprio site em WebP, sem uma requisição a um banco de imagens externo. Os arquivos locais preservam a possibilidade de cache e de uso offline após o carregamento da aplicação.

### Acesso ao PTT e menu no celular

O hero oferece “Experimentar o PTT”, e o CTA “Teste a conexão” do cabeçalho aponta diretamente para `#ptt`. O link da seção de expedição e a ação do detalhe PTT chegam ao mesmo destino. Manter um único controle evita que duas instâncias instalem os mesmos listeners globais de Espaço e disputem o estado da transmissão. No celular, os links do hero e da expedição tornam essa demonstração acessível durante a leitura, mesmo quando o CTA do cabeçalho não aparece no layout compacto.

`Navbar` usa `aria-expanded` para informar se o menu está aberto e `aria-controls` para relacionar o botão à navegação. Escape fecha o menu e devolve o foco ao botão de abertura. Um clique fora do cabeçalho também fecha o menu, sem mover o foco à força. Ao redimensionar para a versão desktop, o estado aberto é limpo para não reaparecer inadvertidamente ao voltar ao celular. Os listeners só existem enquanto o menu está aberto e são removidos no cleanup do efeito.

### Mapa e benefícios

O mapa usa SVG com geometria geográfica simplificada e projeção equiretangular. Latitude e longitude se transformam em coordenadas X/Y. Origem e destino definem uma curva quadrática pontilhada. A distância exibida usa a fórmula de Haversine com as coordenadas das cidades, arredondada em quilômetros; é uma aproximação sobre a superfície terrestre, não o comprimento de uma rota de satélite. Clique em uma cidade ou use os botões abaixo; a escolha alterna entre origem e destino. O botão central inverte os pontos. Selecionar a mesma cidade do outro lado troca os pontos, evitando uma rota vazia.

Cada benefício é um botão real com `aria-expanded` e `aria-controls`. O texto adicional abre e fecha com animação de altura. É operável com teclado, sem depender de hover.

### PWA

`vite-plugin-pwa` gera `dist/manifest.json`, `dist/sw.js` e o runtime Workbox. O manifesto descreve nome, cores, modo standalone e ícones. O service worker armazena a aplicação, fontes e texturas no cache. O guia e o ZIP ficam fora do precache para não aumentar o download inicial.

A instalação depende de HTTPS, navegador e critérios de instalação. Chrome/Edge podem expor `beforeinstallprompt`; o botão usa esse evento quando disponível. No iPhone, o site mostra o caminho pelo Safari. A captura de um evento não garante instalação: o usuário ainda decide no diálogo do navegador. Um site privado com autenticação também pode afetar a instalação e o funcionamento offline; valide no domínio público definitivo.

## 5. Testar as interações

1. Hero: mova o mouse sobre o aparelho e observe o parallax; no modo Órbita, confira a Terra e os satélites. Alterne para Expedição e volte. Abra um detalhe, foque o botão de fechar e use Escape: o foco deve retornar ao ponto explorado.
2. PTT: segure e solte com mouse, toque, Espaço e Enter. Solte fora do botão e mude de aba durante a pressão. O botão deve sair do estado pressionado. Acompanhe a preparação, o trânsito e o recebimento no painel; pressione novamente e confira o reinício. Os 2,4 segundos são uma duração ilustrativa da animação.
3. Som: ative o ícone da navegação, teste o PTT e silencie durante a transmissão.
4. Simulador: percorra os seis passos, use Anterior e Reiniciar. Com o simulador focado, use ←, → e Home. Os botões ficam desativados nos limites.
5. Textos: alterne Resumido/Detalhado. A etapa atual deve ser preservada.
6. Scroll: observe barra de progresso, link ativo e destaque das etapas.
7. Mapa: escolha cidades diferentes; selecione origem/destino e inverta a rota. Use Tab e Enter nos pontos SVG ou os botões das cidades.
8. Benefícios: abra e feche cada item com mouse e teclado.
9. Celular: confira o menu, a disposição vertical e os links diretos ao PTT. Teste fechamento do menu por Escape, clique fora e mudança para desktop; com Escape, confira o retorno de foco. Experimente o controle de movimento em aparelho compatível. Sensores não são plenamente verificáveis em um emulador.
10. Acessibilidade: use somente Tab, Shift+Tab, Enter e Espaço; confira foco visível e o link “Pular para o conteúdo”. Ative movimento reduzido no sistema.
11. PWA: use o build de produção via localhost ou HTTPS. No DevTools, consulte Application → Manifest e Service Workers. Recarregue depois do primeiro acesso para o service worker controlar a página; teste Offline e instalação. Limpe o service worker para reproduzir um visitante novo.
12. Expedição: selecione os três momentos com clique ou toque. Entre nas abas com Tab e use ←, →, Home e End; o foco e o texto devem mudar juntos. Tab deve percorrer apenas uma aba selecionada, em vez de parar nas três. Confira o link “Experimente o PTT”, que leva ao controle existente no hero.

Testes automatizados:

```bash
npm run build
npm test
```

No ambiente de entrega, Chromium está em `/usr/bin/chromium`. Em outro sistema, configure `CHROMIUM_PATH` com o caminho do navegador, ou instale o navegador do Playwright (o config detecta automaticamente a ausência do Chromium de sistema):

```bash
npx playwright install chromium
npm test
```

A suíte também verifica os pontos exploráveis do aparelho e a reprodução/pausa da jornada. Ela cobre 360, 768 e 1280 px; overflow; menu; PTT com mouse, teclado e cancelamento de toque; limite e reinício do simulador; detalhes; mapa; benefícios; manifesto e registro do service worker. `tests/upgrade.spec.ts` acrescenta o ciclo completo e a repetição do feedback PTT, o fechamento e foco do menu, as abas da expedição por teclado, o destino do CTA, a troca de cenário e o fechamento dos detalhes com Escape. Também verifica a imagem e os três momentos da expedição nas mesmas larguras. O teste com movimento reduzido usa a versão leve. A cena 3D também foi inspecionada separadamente com WebGL habilitado.

Lighthouse:

```bash
npm run build
npm run preview
npx lighthouse http://localhost:4173 --view
```

Execute a medição novamente no domínio final. Servidor, cache, GPU e extensões alteram a pontuação. Uma meta de 90 não é uma garantia em todo aparelho. Confira o relatório de validação entregue para os resultados efetivamente medidos.

## 6. Hospedagem — o que enviar

Este é um site estático. O que vai para a hospedagem é o CONTEÚDO de `dist`, incluindo arquivos de assets, manifest.json, sw.js, ícones e texturas. Não envie `node_modules` e não publique a pasta de desenvolvimento como raiz do site.

### Vercel

Suba o projeto para seu repositório e importe na Vercel. Preset: Vite. Build: `npm run build`. Diretório de saída: `dist`. Node: 22.12+ ou 24. Não é necessário backend, banco ou variável secreta.

### Netlify

Importe o repositório, configure `npm run build` e diretório `dist`; ou faça o deploy manual da pasta `dist` depois de compilar localmente. Ative HTTPS no domínio final.

### Cloudflare Pages

Conecte o repositório, escolha framework Vite, comando `npm run build` e saída `dist`. As ferramentas Sites desta sessão podem publicar uma versão privada para revisão; para seu domínio comercial, use a conta e o provedor que preferir.

### Hospedagem tradicional, cPanel ou VPS

Execute o build no seu computador e envie o conteúdo de `dist` para `public_html` ou para a raiz configurada no servidor web. Configure TLS/HTTPS e MIME correto para `.js`, `.css`, `.json`, `.woff2` e `.webmanifest` caso use outra extensão de manifesto. Configure `Cache-Control: no-cache` em `index.html` e `sw.js`; assets com hash podem usar cache longo e `immutable`.

A página usa âncoras (`#jornada`), não rotas de servidor. Portanto, não exige regras especiais de reescrita de SPA para navegar nas seções. Preserve o acesso direto a `/guia.html` e `/walk-talk-source.zip`.

### Domínio e subpastas

A configuração entregue considera a raiz de um domínio, como `https://www.seudominio.com/`. Antes do lançamento público, atualize `og:url` e `og:image` em `index.html` com esse domínio. A imagem Open Graph deve usar URL HTTPS absoluta.

Para publicar em uma subpasta, não basta alterar apenas `base` do Vite. Ajuste também URLs absolutas de texturas, ícones, guia, ZIP, `start_url`, `scope`, `id` e registro do service worker. Prefira domínio ou subdomínio dedicado para manter a configuração entregue.

### Atualizações

Altere os fontes, execute o build e publique todos os arquivos de `dist` juntos. O plugin usa atualização automática de service worker; abas antigas podem precisar recarregar para receber a nova interface. Não apague arquivos com hash ainda referenciados por abas antigas se seu provedor suportar deploys atômicos.

## 7. Empacotar como app de desktop (opcional)

A PWA já permite instalação em navegadores compatíveis. Para distribuir um executável próprio, Tauri 2 é uma opção que reutiliza o frontend e usa o WebView do sistema:

```bash
npm install -D @tauri-apps/cli
npx tauri init
```

Instale antes o Rust e as dependências do sistema seguindo a documentação oficial: https://v2.tauri.app/start/prerequisites/

No `src-tauri/tauri.conf.json`, ajuste a seção de build:

```json
{
  "build": {
    "beforeDevCommand": "npm run dev -- --port 5173",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  }
}
```

Preserve os outros campos criados pelo Tauri. Depois:

```bash
npx tauri dev
npx tauri build
```

Gere o instalador na plataforma de destino, configure identificador reverso de domínio e assinatura/notarização quando necessário. O service worker da PWA não é necessário no shell Tauri: use um modo de build separado e desative o plugin PWA nesse modo. Revise também os links de download e a ação “Instalar” para o contexto desktop.

Electron é outra opção, com maior tamanho de distribuição: carregue o frontend no processo renderer, mantenha `nodeIntegration: false`, `contextIsolation: true` e sandbox ativo, e empacote com Electron Forge. Ao usar `file://`, as URLs absolutas de assets precisam ser adaptadas ou servidas por protocolo seguro próprio. A versão entregue é a aplicação web/PWA; não inclui binários Tauri ou Electron já compilados.

## 8. Conteúdo comercial e limites do demonstrador

O fluxo visual ilustra o conceito solicitado. A topologia real pode envolver estações terrestres, links entre satélites, autenticação e infraestrutura de operadora. Cobertura, criptografia, latência, compatibilidade e certificações precisam ser confirmadas com a ficha técnica antes de vender um equipamento real. O mapa não é um mapa operacional de cobertura.

O PTT deste site não transmite dados de áudio, não usa microfone e não chama uma rede satelital. O estado fica no navegador e não é persistido entre visitas. Não há cadastro, rastreamento, formulário de captação ou API oculta.

## 9. Assets e manutenção

- Imagem do aparelho: conceito visual gerado por IA para este projeto; não é fotografia de um equipamento comercial existente. Distribuída em WebP com versões de 480 e 800 pixels de largura.
- Paisagem de expedição: imagem conceitual gerada por IA, usada no cenário do aparelho e na seção `FieldExperience`; não documenta uma expedição real nem comprova cobertura de uma operadora. Os arquivos `public/landscapes/expedition.webp` e `expedition-mobile.webp` são locais e otimizados para desktop e celular.
- Texturas locais de Terra: exemplos públicos do projeto three-globe, https://github.com/vasturiano/three-globe/tree/master/example/img (imagens da Terra utilizadas nos exemplos do projeto). Preserve a origem e verifique as atribuições do provedor original antes de uso comercial.
- Geometria do mapa: world.geojson distribuído no D3 Graph Gallery, https://github.com/holtzy/D3-graph-gallery/blob/master/DATA/world.geojson; convertido em paths SVG simplificados. Fronteiras são meramente ilustrativas.
- Fontes: Space Grotesk e Inter, distribuídas por Fontsource; as licenças OFL acompanham seus pacotes npm.
- Ícones: Lucide React, licença ISC. Ícones PWA e imagem Open Graph foram desenhados para este projeto.

Para editar cores, abra `src/index.css`; para textos gerais, `src/assets/content.ts`; para os momentos da expedição, o array `moments` em `src/sections/FieldExperience.tsx`; para meta tags, `index.html`; para nome e ícones do app, `vite.config.ts`. Os estilos específicos da expedição e do feedback PTT ficam nos respectivos arquivos CSS ao lado dos componentes. O `tsconfig` usa `strict: true`. Nenhum componente injeta HTML dinâmico.

Para regenerar o guia HTML e o ZIP após alterações, execute `python scripts/package-guide.py` antes de `npm run build`. O guia exibe fonte escapado, como texto; ele não executa os exemplos. O script usa somente a biblioteca padrão Python 3.
