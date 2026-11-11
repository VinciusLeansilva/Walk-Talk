# Validação da versão 2

Revisão de 28/10/2026, horário de São Paulo. Testes locais no Chromium headless/Linux; as notas não são medições da hospedagem final. A versão anterior foi preservada no histórico do site e em VALIDACAO-V1.md.

## O que mudou

- Nova direção visual: grafite, iluminação suave, produto conceitual realista e ciano menos saturado.
- Produto em WebP com duas resoluções, três pontos exploráveis e informações acessíveis por teclado.
- Jornada com reprodução e pausa, interrompida ao sair da tela, ocultar a aba ou selecionar uma etapa.
- Diagrama e aparelho com a mesma identidade visual, textos maiores e seis etapas reorganizadas em duas colunas.
- Mapa com nomes da rota e distância aproximada calculada a partir das coordenadas.
- Renderização 3D limitada a 30 quadros por segundo e DPR máximo 1,25. Fallback usa uma textura WebP de 38 kB; a criação do Canvas é adiada em 700 ms.

## Testes

- Build de produção e TypeScript estrito: aprovados.
- Playwright: 10 testes passaram. Layouts de 360, 768 e 1280 pixels, menu, PTT com mouse/teclado/toque, cancelamento do gesto, simulador, mapa, benefícios, PWA e navegação offline, pontos do produto e reprodução/pausa.
- axe-core WCAG 2 A/AA e 2.1 AA: nenhuma violação automática encontrada nas seções carregadas.

## Lighthouse — auditoria local

| Métrica | Mobile | Desktop |
| --- | ---: | ---: |
| Desempenho | 92 | 71 |
| Acessibilidade | 100 | 100 |
| Boas práticas | 100 | 100 |
| SEO | 100 | 100 |

A meta acima de 90 foi atingida na medição mobile. No desktop, a cena 3D foi avaliada com renderização gráfica por software (SwiftShader), e a meta não foi atingida. Os resultados variam por CPU, GPU, conexão e servidor; repita os testes no domínio definitivo.

## Limites

- O aparelho mostrado é uma imagem conceitual gerada por IA, não uma fotografia de um produto comercial confirmado.
- Instalação em celular físico, giroscópio real, leitores de tela e resposta audível de cada sistema exigem validação nos aparelhos. O manifesto e o funcionamento offline foram testados no Chromium.
- O PTT não grava nem envia voz e não realiza chamadas via satélite. As rotas são ilustrativas, e a distância exibida não é o comprimento de um enlace satelital.
- A versão hospedada permanece privada para revisão. O guia explica a publicação com domínio próprio e HTTPS.
