# Validação da versão 5 — site multipágina em modo escuro

Revisão de 06/11/2026. Testes locais em Linux, Node.js 24 e Chromium. Dados fictícios de testes permanecem no emulador local e não são publicados no banco hospedado.

## Funcionalidade

- TypeScript estrito e build de produção Vinext/Workers aprovados.
- 13 testes de API com SQLite real aprovados: autenticação, empresas, permissões, validações, convites, origem das escritas e exportação.
- 34 testes de navegador aprovados: 17 da apresentação, 9 do portal/saúde e 8 das novas páginas. Total: 47 testes.
- A primeira execução identificou uma expectativa antiga do menu: o teste procurava o link Cobertura após a reorganização da navegação. Ele passou a verificar Como funciona na navegação principal e foi repetido com sucesso. Os outros 33 testes passaram na execução completa.
- As novas rotas /produto, /solucoes, /ajuda e /privacidade respondem diretamente. A rota desconhecida retorna HTTP 404 com caminhos para início e ajuda.
- Busca sem acentos e categorias combinadas na ajuda, respostas expansíveis, estado vazio e limpeza dos filtros testados.
- Abas de soluções com setas, Home e End; menu móvel com Escape e retorno do foco; navegação entre páginas testados.
- Portal, equipamentos, equipes, mensagens e convites continuam usando o back-end existente. Nenhuma migração de schema foi necessária.

## Acessibilidade e visual

Onze telas auditadas com axe-core WCAG 2 A/AA e 2.1 A/AA: seis vistas do portal, saúde independente e as quatro páginas novas. Nenhuma violação automática restante após o ajuste do nome acessível do logotipo compartilhado. Não houve erros JavaScript nas verificações das novas páginas e do portal.

Apresentação, portal, saúde e páginas novas foram verificados em 360, 768 e 1280 px. Não houve overflow horizontal. Capturas de desktop e celular documentam o tema escuro, incluindo tabelas, estados vazios, formulários e cartões. Auditorias automáticas não substituem avaliações com leitores de tela e dispositivos físicos.

## Desempenho

A medição da versão 4 permanece no relatório histórico VALIDACAO-V4.md. Resultados variam conforme rota, dispositivo, rede e servidor. A auditoria Lighthouse mobile local de /produto registrou 94 em desempenho e 100 em acessibilidade, boas práticas e SEO. O relatório JSON está nos artefatos de revisão; as notas se referem a essa rota e a essa execução.

## Hospedagem e limites

- Hospedagem Sites: HTTPS, Worker TypeScript e banco D1. Identidade do Site e audiência privada existentes preservadas. O convite do aplicativo não altera as permissões de visita da hospedagem.
- Esta versão não foi implantada no Render. A migração para Render exige adaptar Worker/D1 e autenticação; o guia explica essas diferenças. Não há login autônomo por senha.
- O banco tem sete tabelas existentes; os dados das empresas não são substituídos por dados de demonstração na publicação.
- Equipamentos e conferências são registros manuais. Não há telemetria, transmissão satelital real ou canal de emergência.
- Saúde permanece apenas informativa. As marcações do roteiro ficam na memória da página e desaparecem ao recarregar; nenhum dado clínico é coletado.
- A PWA armazena somente recursos públicos de instalação e a tela offline. Portal, contas, conversas e respostas da API não são guardados no cache offline; requerem internet.
- Instalação física da PWA, giroscópio, sons em todos os sistemas e binários desktop não foram validados em aparelhos reais.
