# Validação da versão 4 — full stack

Revisão de 05/11/2026. Testes locais em Linux, Node.js 24 e Chromium. Os dados de teste são fictícios e pertencem apenas ao emulador local; não são enviados ao banco hospedado.

## Funcionalidade

- TypeScript estrito e build de produção Vinext/Workers aprovados.
- Migração Drizzle gerada e aplicada no D1 local: sete tabelas, constraints e índices.
- 13 testes de API com SQLite real aprovados: identidade, bootstrap atômico, isolamento entre empresas, restrições de colaborador e gestor, referências cruzadas, convite vinculado a e-mail, expiração/revogação/uso único/concorrência, origem de escrita, limite de corpo, texto puro, CSV seguro, métricas sem truncamento e reatribuição concorrente.
- 9 testes de navegador do portal aprovados: onboarding sem dados fictícios por padrão, exemplos opt-in, equipes, cadastro/edição/verificação/arquivamento, persistência após reload, mensagens, convite aceito por outra identidade, perfil colaborador, saúde sem envio ou persistência de respostas e telas de 360/768/1280 px.
- 17 testes da apresentação preservada aprovados: PTT mouse/toque/teclado/cancelamento, som, simulador, mapa, detalhes, expedição, menu, instalação e página offline. Total: 39 testes.

## Acessibilidade e visual

Sete telas principais verificadas com axe-core WCAG 2 A/AA e 2.1 A/AA: visão geral, equipamentos, equipes, comunicação, saúde no portal, acessos/convites e saúde independente. Nenhuma violação automática restante após ajustes de contraste e nome acessível do logo. A página independente de saúde tem região main própria; embutida no portal, evita main aninhado.

Layouts do portal e da saúde verificados em 360, 768 e 1280 px, sem overflow horizontal. Capturas de desktop e celular guardadas como artefatos de revisão. Isso não substitui testes manuais com leitores de tela e dispositivos físicos.

## Desempenho

Os resultados Lighthouse da landing v3 não são uma medição desta arquitetura. A auditoria mobile local de /saude, repetida em 06/11/2026 após o ajuste semântico, registrou 100 em desempenho, 100 em acessibilidade, 100 em boas práticas e 100 em SEO. O relatório JSON está nos artefatos de revisão. As notas variam por rota, dispositivo, rede e servidor; não se afirma que todas as páginas atinjam a mesma nota.

## Limites da entrega

- Login da hospedagem depende de Sites; desenvolvimento tem mock local do plugin oficial, excluído da produção. Não há login autônomo por senha.
- Acesso privado da hospedagem é preservado. Convite do aplicativo não concede acesso ao próprio Site; o administrador deve autorizar a pessoa também no compartilhamento da hospedagem.
- Uma empresa por conta e um administrador fundador por empresa. Limites de listagem estão em ARQUITETURA.md.
- Equipamentos e verificações são registros manuais. Não há integração com hardware, telemetria, chamadas via satélite ou canal de emergência.
- Saúde é somente informação educativa. O roteiro usa memória local da página e não coleta dados clínicos.
- PWA: manifesto e fallback offline testados. Portal, contas, HTML privado e conversas não ficam no cache offline; o portal requer internet.
- Instalação física da PWA, giroscópio, sons em todos os sistemas e binários desktop não foram validados em aparelhos reais.
