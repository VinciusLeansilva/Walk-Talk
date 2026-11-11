# WALK TALK — Comunicação sem Fronteiras

Versão 5: site multipágina e portal empresarial full stack, inteiramente em modo escuro. Front-end React + TypeScript + Vite/Vinext; back-end TypeScript em Cloudflare Workers; banco D1 com migrações Drizzle. A página de saúde ocupacional é exclusivamente educativa.

## Executar

Requer Node.js 24 LTS e Python 3 para gerar o pacote de código.

```bash
npm ci
npm run db:generate # apenas após mudar o schema; a migração inicial já está incluída
npm run build
npm run db:local
npm run dev
```

No desenvolvimento, abra o endereço local e use **Entrar com ChatGPT**: a integração oficial Sites simula uma identidade local, excluída de produção. Crie uma empresa vazia ou escolha explicitamente incluir exemplos fictícios.

```bash
npm run typecheck
npm run test:api
npm run build
npm run db:local
npm test
```

`npm start` executa o Worker compilado em http://127.0.0.1:4173. Esse modo não simula o login; os testes usam cabeçalhos de identidade apenas no emulador local. A hospedagem Sites injeta a identidade de forma autenticada.

## Rotas

- `/`: apresentação interativa do aparelho, Terra 3D e PTT ilustrativo.
- `/produto`: apresentação do conceito, recursos e demonstrações.
- `/solucoes`: cenários de uso por setor e fluxos para equipes.
- `/ajuda`: central de ajuda com busca, categorias e orientações.
- `/privacidade`: como os dados e as permissões funcionam.
- `/portal`: equipamentos, equipes, conversas, convites e permissões.
- `/saude`: informações sobre LER/DORT, ergonomia, pausas e organização do trabalho.
- `/api/v1/*`: API autenticada e isolada por empresa.
- `/guia.html`: guia completo e fonte por arquivo.

O portal tem banco real; o produto e o sinal satelital continuam conceituais. Não existe integração de telemetria ou transmissão satelital. Nenhum dado de saúde é coletado.

## Hospedagem

A versão publicada usa **Sites**, com HTTPS, Cloudflare Workers e D1 integrados. Endereço: https://walk-talk-orbital-1028.vinicius-silva205.chatgpt.site. A audiência privada existente é preservada.

Esta versão precisa de **Worker + D1**; apenas subir arquivos em hospedagem estática não executa a API. O manifesto `.openai/hosting.json` mantém a identidade do Site e declara `d1: "DB"`. O plugin oficial `@openai/sites-vite-plugin` inclui assets, configuração e migrações no build. Consulte [docs/GUIA.md](docs/GUIA.md) para Sites, domínio próprio e alternativa Cloudflare.

O projeto não é um serviço Node pronto para Render. Para migrar a Render, é necessário adaptar a API para Node, substituir D1 por um banco compatível e implementar autenticação verificada. Não basta mudar o comando de inicialização.

Arquitetura e permissões: [docs/ARQUITETURA.md](docs/ARQUITETURA.md). Contrato da API: [docs/API.md](docs/API.md). Validação: [docs/VALIDACAO.md](docs/VALIDACAO.md).

Para atualizar o download e a documentação: `python scripts/package-guide.py`, seguido de `npm run build`. O ZIP exclui caches locais, dados do emulador, credenciais e dependências.
