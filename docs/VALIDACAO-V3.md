# Validação da versão 3

Revisão de 29/10/2026. Verificações locais em Chromium headless/Linux. Estes resultados não são medições do domínio hospedado nem de celulares físicos. Os relatórios anteriores estão em VALIDACAO-V1.md e VALIDACAO-V2.md.

## O que mudou

- Apresentação do aparelho com cenários Órbita/Expedição e detalhes maiores, ações contextuais, fechamento por Escape e retorno do foco.
- Seção de expedição com paisagem conceitual, três momentos selecionáveis e exemplos de conversa. Abas com navegação por setas, Home e End.
- Retorno visual do PTT: preparação, trânsito pelo satélite e chegada ao destinatário. O intervalo de 2,4 segundos é apenas uma animação educativa, não uma medição de rede.
- Acesso direto ao PTT no cabeçalho e antes do aparelho no celular. Menu fecha ao clicar fora, pressionar Escape ou mudar para desktop.
- Imagens locais em WebP, seção nova carregada sob demanda, modo leve preservado e cores de instalação da PWA alinhadas ao site.

## Verificações

- Build de produção e TypeScript estrito: aprovados.
- Playwright: 17 testes aprovados (10 existentes e 7 novos). Incluem layouts 360/768/1280, mouse, toque/cancelamento, teclado, simulação completa e repetição do PTT, cenários, abas, menu/foco, jornada de seis etapas, mapa, benefícios, manifesto e navegação offline.
- axe-core WCAG 2 A/AA e 2.1 A/AA: nenhum problema automático restante após corrigir o nome acessível do logo.
- Cena WebGL e capturas finais conferidas no desktop. Versão leve conferida em telas pequenas.

## Lighthouse mobile — medição local da versão 3

| Métrica | Nota |
| --- | ---: |
| Desempenho | 92 |
| Acessibilidade | 100 |
| Boas práticas | 100 |
| SEO | 100 |

FCP: 0,8 s. LCP: 3,3 s. Bloqueio total: 70 ms. CLS: 0,003. A meta de desempenho acima de 90 foi atendida nesta medição mobile, sem garantia de resultado em qualquer aparelho ou hospedagem. A medição desktop não foi repetida nesta versão; o relatório anterior registra 71 com GPU emulada por SwiftShader. Repita a auditoria no domínio definitivo e em dispositivos reais.

## Limites

- Aparelho e paisagem são imagens conceituais geradas por IA. Não representam fotografia de um produto comercial confirmado nem um teste de campo real.
- O PTT não captura nem transmite voz. Mensagens, rotas, etapas e confirmação de chegada são ilustrativas. Disponibilidade real depende do aparelho e da rede contratada.
- Instalação em celular físico, giroscópio, leitores de tela e saída de áudio em cada plataforma precisam de verificação nos dispositivos.
- A hospedagem mantém o acesso privado para revisão. O guia inclui comandos, código completo e instruções para hospedar com HTTPS e domínio próprio.
