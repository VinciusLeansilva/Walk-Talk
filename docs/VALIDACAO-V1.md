# Validação da entrega

Testes executados em Chromium headless no ambiente Linux de desenvolvimento, em 28/10/2026. Resultados locais; não são medições da hospedagem final.

## Verificações concluídas

- TypeScript estrito e build de produção: aprovados, incluindo pré-renderização e service worker.
- Playwright: 8 testes passaram. Cobrem 360, 768 e 1280 px, ausência de overflow, menu, PTT com mouse/teclado/toque, cancelamento de gesto, controles do simulador, mapa, benefícios, instruções de instalação e PWA offline.
- axe-core, regras WCAG 2 A/AA e 2.1 AA: nenhuma violação automática encontrada, com todas as seções carregadas. Isso não substitui auditoria humana com leitores de tela.
- Terra 3D inspecionada visualmente em Chromium com WebGL/SwiftShader. O teste visual não representa desempenho em GPU física.

## Lighthouse — última medição

| Métrica | Mobile | Desktop |
| --- | ---: | ---: |
| Desempenho | 77 | 59 |
| Acessibilidade | 100 | 100 |
| Boas práticas | 100 | 100 |
| SEO | 100 | 100 |

Mobile: LCP 3.6 s; bloqueio total 510 ms; CLS 0.001.

**A meta de desempenho acima de 90 ainda não foi atingida neste ambiente.** O desktop foi medido com GPU por software (SwiftShader), que limita a cena 3D. O mobile usa emulação e CPU limitada. Não há garantia de que um dispositivo real terá a mesma nota; repita a auditoria no domínio final e em aparelhos representativos.

Já foram aplicados: divisão de código, carregamento progressivo, fontes e texturas locais, pré-renderização do primeiro conteúdo, assets otimizados, DPR limitado, descarte de cenas fora de tela, rolagem nativa no toque e fallback em dispositivos modestos. A cena Three.js permanece o maior chunk (aproximadamente 917 kB antes de gzip), carregado separadamente.

## Limites de verificação

- Instalação em iPhone/Android físico e distribuição por Tauri/Electron não foram executadas. O manifesto, os ícones, o registro do service worker e a navegação offline foram testados no Chromium.
- Giroscópio depende de sensor físico e permissão; seu comportamento real deve ser validado em celular compatível.
- Os testes de som verificam o controle da interface. Volume e resposta audível variam por sistema e devem ser conferidos no aparelho.
- Nenhuma transmissão via satélite real, gravação de voz ou serviço externo foi implementado. É uma demonstração do produto.
- A versão Sites é privada para revisão; use o guia para hospedar publicamente com domínio próprio e HTTPS.
