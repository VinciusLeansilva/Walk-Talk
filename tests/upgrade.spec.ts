import { test, expect } from "@playwright/test";

test("PTT: feedback acompanha a mensagem e reinicia em uma nova pressão", async ({
  page,
}) => {
  await page.goto("/");
  const ptt = page.locator("#ptt");
  const feedback = page.getByRole("region", {
    name: "Acompanhe a transmissão simulada",
  });
  const status = feedback.getByRole("status");
  await expect(status).toHaveText("Pronto para conectar");
  await expect(feedback.getByRole("listitem")).toHaveCount(3);
  await expect(feedback).toContainText(
    "Simulação visual. Nenhuma voz é gravada ou enviada.",
  );

  await ptt.scrollIntoViewIfNeeded();
  await ptt.focus();
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.keyboard.down("Space");
    await expect(ptt).toHaveAttribute("aria-pressed", "true");
    await expect(status).toHaveText("Preparando sua mensagem");
    await page.keyboard.up("Space");
    await expect(ptt).toHaveAttribute("aria-pressed", "false");
    await expect(status).toHaveText("Sinal em trânsito");
    await expect(
      feedback.locator(".transmission-connector i").first(),
    ).toHaveCSS("animation-name", "none");
    await expect(status).toHaveText("Mensagem recebida", { timeout: 5000 });
  }
});

test("menu mobile: Escape retorna foco, clique fora e desktop encerram o menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Navegação principal",
  });
  const menu = page.locator(".menu-toggle");
  await expect(menu).toHaveAttribute("aria-controls", "primary-navigation");
  await menu.click();
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link").first().focus();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");

  await menu.click();
  await expect(navigation).toBeVisible();
  await page.mouse.click(8, 550);
  await expect(navigation).toBeHidden();
  await expect(menu).toHaveAttribute("aria-expanded", "false");

  await menu.click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(navigation).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeHidden();
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(navigation).toBeHidden();
  await expect(page.locator(".nav-cta")).toHaveAttribute("href", "/portal");
});

test("expedição: abas seguem setas, Home e End e levam ao único PTT", async ({
  page,
}) => {
  await page.goto("/#expedicao");
  const tabs = page.getByRole("tablist", { name: "Momentos da expedição" });
  const departure = tabs.getByRole("tab", { name: /A partida/ });
  const crossing = tabs.getByRole("tab", { name: /A travessia/ });
  const reunion = tabs.getByRole("tab", { name: /O reencontro/ });
  const panel = page.locator("#field-panel");

  await expect(crossing).toHaveAttribute("aria-selected", "true");
  await crossing.focus();
  await page.keyboard.press("ArrowRight");
  await expect(reunion).toBeFocused();
  await expect(reunion).toHaveAttribute("aria-selected", "true");
  await expect(panel).toContainText("Chegamos ao ponto de encontro");

  await page.keyboard.press("ArrowRight");
  await expect(departure).toBeFocused();
  await expect(panel).toContainText("Estamos começando a trilha");
  await page.keyboard.press("ArrowLeft");
  await expect(reunion).toBeFocused();
  await page.keyboard.press("Home");
  await expect(departure).toBeFocused();
  await expect(departure).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(reunion).toBeFocused();
  await expect(reunion).toHaveAttribute("aria-selected", "true");
  await expect(panel).toHaveAttribute("aria-labelledby", "field-tab-2");
  await expect(tabs.locator('[tabindex="0"]')).toHaveCount(1);

  const action = panel.getByRole("link", { name: "Experimente o PTT" });
  await expect(action).toHaveAttribute("href", "#ptt");
  await action.click();
  await expect(page).toHaveURL(/#ptt$/);
  await expect(page.locator("#ptt")).toHaveCount(1);
  await expect(page.locator("#ptt")).toBeInViewport();
});

test("aparelho: cenário alternável e Escape devolve foco ao ponto explorado", async ({
  page,
}) => {
  await page.goto("/");
  const scenes = page.getByRole("group", { name: "Cenário do aparelho" });
  const orbit = scenes.getByRole("button", { name: "Órbita", exact: true });
  const expedition = scenes.getByRole("button", {
    name: "Expedição",
    exact: true,
  });
  await orbit.click();
  await expect(orbit).toHaveAttribute("aria-pressed", "true");
  await expect(expedition).toHaveAttribute("aria-pressed", "false");
  await expedition.click();
  await expect(expedition).toHaveAttribute("aria-pressed", "true");
  await expect(orbit).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.locator(".product-landscape img, img.product-landscape"),
  ).toHaveAttribute("alt", "");

  const antenna = page.getByRole("button", {
    name: "Explorar Antena satelital",
    exact: true,
  });
  await antenna.click();
  await expect(antenna).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("button", { name: "Fechar detalhe do aparelho" })
    .focus();
  await page.keyboard.press("Escape");
  await expect(antenna).toHaveAttribute("aria-expanded", "false");
  await expect(antenna).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Fechar detalhe do aparelho" }),
  ).toHaveCount(0);
});

for (const width of [360, 768, 1280]) {
  test(`expedição ${width}px: imagem carregada e todos os momentos sem overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#expedicao");
    const section = page.locator("#expedicao .field-section");
    await expect(section).toBeVisible();
    const photograph = section.locator(".field-photograph img");
    await expect
      .poll(() =>
        photograph.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true);

    const tabs = section.getByRole("tab");
    for (let moment = 0; moment < 3; moment++) {
      await tabs.nth(moment).click();
      await expect(tabs.nth(moment)).toHaveAttribute("aria-selected", "true");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const panel = await section.locator("#field-panel").boundingBox();
      expect(panel).not.toBeNull();
      expect(panel!.x).toBeGreaterThanOrEqual(0);
      expect(panel!.x + panel!.width).toBeLessThanOrEqual(width + 1);
    }
  });
}
