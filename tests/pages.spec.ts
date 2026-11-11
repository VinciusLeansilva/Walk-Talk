import { test, expect } from "@playwright/test";

const publicRoutes = ["/produto", "/solucoes", "/ajuda", "/privacidade"];

test("páginas: navegação conecta produto, soluções, ajuda e privacidade", async ({ page }) => {
  await page.goto("/produto");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("HORIZONTE.");
  const navigation = page.getByRole("navigation", { name: "Navegação principal" });
  await navigation.getByRole("link", { name: "Soluções", exact: true }).click();
  await expect(page).toHaveURL(/\/solucoes$/);
  await expect(navigation.getByRole("link", { name: "Soluções", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("OPERAÇÃO ORGANIZADA.");
  await navigation.getByRole("link", { name: "Ajuda", exact: true }).click();
  await expect(page).toHaveURL(/\/ajuda$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacidade e dados", exact: true }).click();
  await expect(page).toHaveURL(/\/privacidade$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Portal da empresa", exact: true })).toHaveAttribute("href", "/portal");
});

test("páginas: menu mobile fecha com Escape, retorna foco e navega para saúde", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/produto");
  const navigation = page.getByRole("navigation", { name: "Navegação principal" });
  const toggle = page.getByRole("button", { name: "Abrir menu", exact: true });
  await expect(navigation).toBeHidden();
  await toggle.click();
  await expect(navigation).toBeVisible();
  await navigation.getByRole("link", { name: "Soluções", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await navigation.getByRole("link", { name: "Saúde ocupacional", exact: true }).click();
  await expect(page).toHaveURL(/\/saude$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("CUIDAR DA ROTINA.");
});

test("soluções: teclado percorre cenários e apresenta o fluxo correspondente", async ({ page }) => {
  await page.goto("/solucoes");
  const tabs = page.getByRole("tablist", { name: "Cenários de uso" });
  const field = tabs.getByRole("tab", { name: "Equipes em campo", exact: true });
  const logistics = tabs.getByRole("tab", { name: "Logística", exact: true });
  const worksite = tabs.getByRole("tab", { name: "Obras e manutenção", exact: true });
  const panel = page.getByRole("tabpanel");
  await expect(field).toHaveAttribute("aria-selected", "true");
  await field.focus();
  await page.keyboard.press("ArrowRight");
  await expect(logistics).toBeFocused();
  await expect(logistics).toHaveAttribute("aria-selected", "true");
  await expect(panel).toContainText("Uma visão organizada dos aparelhos.");
  await expect(panel).toContainText("exporte os dados autorizados em CSV");
  await page.keyboard.press("End");
  await expect(worksite).toBeFocused();
  await expect(panel).toContainText("Cada frente de trabalho, seu espaço.");
  await expect(panel).toContainText("não use o portal como canal de emergência", { ignoreCase: true });
  await page.keyboard.press("ArrowRight");
  await expect(field).toBeFocused();
  await expect(panel).toContainText("Prepare a equipe antes de sair.");
  await page.keyboard.press("ArrowLeft");
  await expect(worksite).toBeFocused();
  await page.keyboard.press("Home");
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute("aria-selected", "true");
});

test("ajuda: busca sem acentos combina com categorias, expande resposta e permite limpar filtros", async ({ page }) => {
  await page.goto("/ajuda");
  const search = page.getByRole("searchbox", { name: /Buscar na central de ajuda/ });
  const categories = page.getByRole("group", { name: "Filtrar por assunto" });
  const results = page.getByRole("region", { name: "Perguntas frequentes", exact: true });
  const questions = results.locator("details");
  const allCount = await questions.count();
  expect(allCount).toBeGreaterThan(3);

  await categories.getByRole("button", { name: /^Equipamentos/ }).click();
  await expect(categories.getByRole("button", { name: /^Equipamentos/ })).toHaveAttribute("aria-pressed", "true");
  await expect(questions).toHaveCount(3);
  await search.fill("CONFERENCIA");
  await expect(questions).toHaveCount(1);
  await expect(results.getByRole("status")).toHaveText("1 resultado");
  const conference = questions.filter({ hasText: "O que significa registrar uma conferência?" });
  await conference.locator("summary").click();
  await expect(conference).toHaveAttribute("open", "");
  await expect(conference).toContainText("É um registro manual feito por uma pessoa.");

  await page.getByRole("button", { name: "Limpar busca", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(questions).toHaveCount(3);
  await search.fill("assunto-que-nao-existe-qa");
  await expect(questions).toHaveCount(0);
  await expect(results.getByRole("heading", { name: "Nenhum resultado por aqui.", exact: true })).toBeVisible();
  await results.getByRole("button", { name: "Limpar filtros", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(categories.getByRole("button", { name: /^Todos/ })).toHaveAttribute("aria-pressed", "true");
  await expect(questions).toHaveCount(allCount);

  await page.getByRole("button", { name: "instalar", exact: true }).click();
  await expect(search).toHaveValue("instalar");
  await expect(questions).toHaveCount(1);
  const install = questions.first();
  await install.locator("summary").click();
  await expect(install).toContainText("Adicionar à Tela de Início");
});

for (const width of [360, 768, 1280]) {
  test(`páginas ${width}px: leitura em modo escuro, sem overflow ou erros de execução`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of publicRoutes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const surface = await page.locator(".wp-site").evaluate((element) => {
        const style = getComputedStyle(element);
        const channels = style.backgroundColor.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
        return {
          dark: style.colorScheme.includes("dark") && channels.length === 3 && channels.every(channel => channel < 65),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      expect(surface.dark, `${route} should have a dark reading surface`).toBe(true);
      expect(surface.overflow, `overflow in ${route} at ${width}px`).toBe(false);
      const images = page.locator("main img");
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      }
    }
    expect(errors).toEqual([]);
  });
}

test("endereço inexistente: resposta 404 oferece um caminho para a ajuda", async ({ page }) => {
  const response = await page.goto("/pagina-que-nao-existe-v5");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("o seu caminho.");
  await page.getByRole("navigation", { name: "Continuar navegando" }).getByRole("link", { name: "Central de ajuda", exact: true }).click();
  await expect(page).toHaveURL(/\/ajuda$/);
  await expect(page.getByRole("main")).toBeVisible();
});
