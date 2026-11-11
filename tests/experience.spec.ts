import { test, expect } from "@playwright/test";
for (const width of [360, 768, 1280]) {
  test(`layout ${width}px sem overflow e menu acessível`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "LONGE DE TUDO.",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 360) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await page
        .getByRole("navigation", { name: "Navegação principal" })
        .getByRole("link", { name: "Como funciona", exact: true })
        .click();
      await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeHidden();
    }
    for (const id of ["expedicao", "jornada", "cobertura", "beneficios"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id} .section`)).toBeVisible();
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".section-placeholder")).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`walk-talk-${width}.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}
test("PTT: mouse, espaço, cancelamento e som desligado inicialmente", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Ativar sons" }),
  ).toHaveAttribute("aria-pressed", "false");
  const ptt = page.locator("#ptt");
  await ptt.scrollIntoViewIfNeeded();
  const box = (await ptt.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + 20);
  await page.mouse.down();
  await expect(ptt).toHaveAttribute("aria-pressed", "true");
  await page.mouse.up();
  await expect(ptt).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByText("Sinal enviado ao satélite · simulação"),
  ).toBeVisible();
  await ptt.focus();
  await page.keyboard.down("Space");
  await expect(ptt).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.up("Space");
  await expect(ptt).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.down("Space");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(ptt).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.up("Space");
  await page.getByRole("button", { name: "Ativar sons" }).click();
  await expect(
    page.getByRole("button", { name: "Silenciar sons" }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("simulador: limites, teclado, seis etapas, detalhe e reinício", async ({
  page,
}) => {
  await page.goto("/#simulador");
  const sim = page.locator("#simulator-panel");
  await sim.focus();
  await page.getByRole("button", { name: "Reiniciar simulação" }).click();
  await expect(
    page.getByRole("button", { name: "Passo anterior" }),
  ).toBeDisabled();
  await sim.focus();
  await page.keyboard.press("ArrowRight");
  await expect(sim.getByRole("heading")).toHaveText("Sua voz vira dados");
  await page.getByRole("button", { name: "Detalhado", exact: true }).click();
  await expect(sim).toContainText("pacotes digitais");
  await page
    .getByRole("button", {
      name: "Passo 6: A sua voz, do outro lado",
      exact: true,
    })
    .click();
  await expect(sim.getByRole("heading")).toHaveText("A sua voz, do outro lado");
  await expect(
    page.getByRole("button", { name: "Próximo", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Reiniciar simulação" }).click();
  await expect(sim.getByRole("heading")).toHaveText("Pressione e fale");
});
test("mapa, benefícios, instruções de instalação e PWA", async ({ page }) => {
  await page.goto("/#cobertura");
  await page
    .locator(".city-options")
    .getByRole("button", { name: "Tóquio" })
    .click();
  await expect(page.locator(".route-panel")).toContainText("Tóquio");
  await page.getByRole("button", { name: "Inverter origem e destino" }).click();
  await expect(page.locator(".route-place").first()).toContainText("Tóquio");
  await page.locator("#beneficios").scrollIntoViewIfNeeded();
  const benefit = page.locator(".benefit-card").first().getByRole("button");
  await benefit.click();
  await expect(benefit).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("A disponibilidade real depende", { exact: false }),
  ).toBeVisible();
  await benefit.click();
  await expect(benefit).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Como instalar" }).click();
  await expect(page.locator(".install-message")).toContainText("Safari");
  const manifest = await (await page.request.get("/manifest.json")).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toHaveLength(3);
  await expect
    .poll(() =>
      page.evaluate(
        async () => !!(await navigator.serviceWorker.getRegistration()),
      ),
    )
    .toBe(true);
});
test("PTT por toque encerra ao cancelar o gesto", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 780 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("http://localhost:4173");
  const ptt = page.locator("#ptt");
  await ptt.scrollIntoViewIfNeeded();
  const box = (await ptt.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: box.x + 35, y: box.y + 20 }],
  });
  await expect(ptt).toHaveAttribute("aria-pressed", "true");
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  await expect(ptt).toHaveAttribute("aria-pressed", "false");
  await context.close();
});

test("PWA: página offline sem armazenar contas ou conversas no cache", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Vamos nos reconectar.",
  );
  const cachedPaths = await page.evaluate(async () => {
    const keys = await caches.keys();
    return (
      await Promise.all(
        keys.map(async (key) =>
          (await (await caches.open(key)).keys()).map(
            (request) => new URL(request.url).pathname,
          ),
        ),
      )
    ).flat();
  });
  expect(
    cachedPaths.some(
      (path) => path.startsWith("/api/") || path.startsWith("/portal"),
    ),
  ).toBe(false);
  await context.setOffline(false);
});

test("produto: pontos clicáveis e fechamento pelo teclado", async ({
  page,
}) => {
  await page.goto("/");
  const antenna = page.getByRole("button", {
    name: "Explorar Antena satelital",
    exact: true,
  });
  await antenna.click();
  await expect(antenna).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#product-detail")).toContainText(
    "Conexão que vai além",
  );
  await page
    .getByRole("button", { name: "Fechar detalhe do aparelho" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(antenna).toHaveAttribute("aria-expanded", "false");
  await page
    .getByRole("button", { name: "Explorar Comando PTT", exact: true })
    .click();
  await expect(page.locator("#product-detail")).toContainText(
    "Pressione para falar",
  );
});

test("jornada: reprodução automática, pausa e controle manual", async ({
  page,
}) => {
  await page.goto("/#simulador");
  await page.getByRole("button", { name: "Reiniciar simulação" }).click();
  await page.getByRole("button", { name: "Reproduzir jornada" }).click();
  await expect(page.locator("#simulator-panel h3")).toHaveText(
    "Sua voz vira dados",
    { timeout: 6000 },
  );
  await page.getByRole("button", { name: "Pausar jornada" }).click();
  await page.waitForTimeout(3000);
  await expect(page.locator("#simulator-panel h3")).toHaveText(
    "Sua voz vira dados",
  );
  await page.getByRole("button", { name: "Reproduzir jornada" }).click();
  await page
    .getByRole("button", {
      name: "Passo 6: A sua voz, do outro lado",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Reproduzir jornada" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#simulator-panel h3")).toHaveText(
    "A sua voz, do outro lado",
  );
});
