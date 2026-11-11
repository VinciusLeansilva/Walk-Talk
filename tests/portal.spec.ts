import { test, expect } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";
import type {
  Session,
  DevicesResponse,
  TeamsResponse,
  MessagesResponse,
} from "../server/types";

const origin = "http://localhost:4173";
type TestUser = { id: string; email: string; name: string };
function identity(label: string): TestUser {
  const id = `qa-${label}-${crypto.randomUUID()}`;
  return { id, email: `${id}@example.test`, name: `Pessoa ${label}` };
}
function headers(user: TestUser) {
  return {
    "oai-authenticated-user-id": user.id,
    "oai-authenticated-user-email": user.email,
    "oai-authenticated-user-full-name": encodeURIComponent(user.name),
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  };
}
async function api<T>(
  request: APIRequestContext,
  user: TestUser,
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const response = await request.fetch(`/api/v1${path}`, {
    method,
    headers: { ...headers(user), Origin: origin },
    ...(data === undefined ? {} : { data }),
  });
  expect(
    response.ok(),
    `${method} ${path}: ${response.status()} ${await response.text()}`,
  ).toBe(true);
  return response.json() as Promise<T>;
}
async function bootstrap(
  request: APIRequestContext,
  user: TestUser,
  examples = false,
) {
  await api(request, user, "/workspace", "POST", {
    name: `Empresa QA ${user.id}`,
    withExamples: examples,
  });
}
async function openPortal(page: Page, user: TestUser, hash = "overview") {
  await page.setExtraHTTPHeaders(headers(user));
  await page.goto(`/portal#${hash}`);
  await expect(page.locator("#portal-content")).toBeVisible();
}

test("portal: onboarding cria empresa sem exemplos por padrão e mantém dados após reload", async ({
  page,
  request,
}) => {
  const user = identity("onboarding");
  await page.setExtraHTTPHeaders(headers(user));
  await page.goto("/portal");
  await expect(
    page.getByLabel("Nome da empresa", { exact: true }),
  ).toBeVisible();
  const sampleOption = page.getByRole("checkbox", {
    name: /Incluir equipes e aparelhos fictícios/,
  });
  await expect(sampleOption).not.toBeChecked();
  const name = `Empresa de onboarding ${user.id}`;
  await page.getByLabel("Nome da empresa", { exact: true }).fill(name);
  await page
    .getByRole("button", { name: "Criar empresa", exact: true })
    .click();
  await expect(page.locator(".wt-workspace")).toContainText(name);
  const session = await api<Session>(request, user, "/session");
  expect(session.member?.role).toBe("admin");
  expect(session.workspace?.isDemo).toBe(false);
  expect(
    (await api<DevicesResponse>(request, user, "/devices")).devices,
  ).toHaveLength(0);
  await page.reload();
  await expect(page.locator(".wt-workspace")).toContainText(name);
  await expect(page.getByLabel("Nome da empresa", { exact: true })).toHaveCount(
    0,
  );
});

test("portal: exemplos só são criados após opção explícita", async ({
  page,
  request,
}) => {
  const user = identity("examples");
  await page.setExtraHTTPHeaders(headers(user));
  await page.goto("/portal");
  await page
    .getByLabel("Nome da empresa", { exact: true })
    .fill(`Demonstração QA ${user.id}`);
  await page
    .getByRole("checkbox", { name: /Incluir equipes e aparelhos fictícios/ })
    .check();
  await page
    .getByRole("button", { name: "Criar empresa", exact: true })
    .click();
  await expect(page.locator(".wt-demo-banner")).toContainText(
    "exemplos fictícios",
  );
  const devices = (await api<DevicesResponse>(request, user, "/devices"))
    .devices;
  expect(devices).toHaveLength(3);
  expect(devices.every((device) => device.isExample)).toBe(true);
  expect(
    (await api<TeamsResponse>(request, user, "/teams")).teams,
  ).toHaveLength(2);
  expect(
    (await api<MessagesResponse>(request, user, "/messages")).messages,
  ).toHaveLength(0);
});

test("portal: equipes e equipamento são cadastrados, editados, verificados e arquivados", async ({
  page,
  request,
}) => {
  const user = identity("inventory");
  await bootstrap(request, user);
  await openPortal(page, user, "teams");
  await page.getByRole("button", { name: "Nova equipe", exact: true }).click();
  const teamDialog = page.getByRole("dialog", { name: "Criar equipe" });
  await teamDialog
    .getByLabel("Nome da equipe", { exact: true })
    .fill("Expedição QA");
  await teamDialog
    .getByLabel("Local de operação", { exact: true })
    .fill("Base de teste");
  await teamDialog
    .getByRole("button", { name: "Criar equipe", exact: true })
    .click();
  await expect(teamDialog).not.toBeVisible();
  await expect(page.locator(".wt-team-card")).toContainText("Expedição QA");
  await page
    .getByRole("navigation", { name: "Navegação do portal" })
    .getByRole("button", { name: "Equipamentos", exact: true })
    .click();
  await page
    .getByRole("button", { name: /^(Novo|Cadastrar) equipamento$/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Nome do equipamento", { exact: true })
    .fill("Rádio principal QA");
  await dialog
    .getByLabel("Número de série / patrimônio", { exact: true })
    .fill(`QA-${user.id}`);
  await dialog.getByLabel("Modelo", { exact: true }).fill("Modelo de teste");
  await dialog
    .getByLabel("Equipe", { exact: true })
    .selectOption({ label: "Expedição QA" });
  await dialog
    .getByRole("button", { name: "Cadastrar equipamento", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  let devices = (await api<DevicesResponse>(request, user, "/devices")).devices;
  expect(devices).toHaveLength(1);
  expect(devices[0].teamName).toBe("Expedição QA");
  await page.reload();
  await expect(
    page.getByText("Rádio principal QA", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Editar Rádio principal QA", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Nome do equipamento", { exact: true })
    .fill("Rádio revisado QA");
  await page
    .getByRole("dialog")
    .getByLabel("Status", { exact: true })
    .selectOption("maintenance");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Salvar alterações", exact: true })
    .click();
  await expect(
    page.getByText("Rádio revisado QA", { exact: true }),
  ).toBeVisible();
  devices = (await api<DevicesResponse>(request, user, "/devices")).devices;
  expect(devices[0].status).toBe("maintenance");
  await page
    .locator(".wt-equipment-card")
    .filter({ hasText: "Rádio revisado QA" })
    .getByRole("button", { name: "Verificar", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (await api<DevicesResponse>(request, user, "/devices")).devices[0]
          .lastCheckAt,
    )
    .not.toBeNull();
  await page
    .getByRole("button", { name: "Arquivar Rádio revisado QA", exact: true })
    .click();
  const archiveDialog = page.getByRole("dialog");
  await archiveDialog
    .getByRole("button", { name: /^(Arquivar|Confirmar arquivamento)/ })
    .click();
  await expect(archiveDialog).not.toBeVisible();
  await expect
    .poll(
      async () =>
        (await api<DevicesResponse>(request, user, "/devices")).devices.length,
    )
    .toBe(0);
});

test("portal: conversa é persistente e conteúdo HTML permanece texto", async ({
  page,
  request,
}) => {
  const user = identity("messages");
  await bootstrap(request, user);
  await openPortal(page, user, "messages");
  const message =
    '<img src=x onerror="window.__qaInjected=true"> Atualização literal de teste.';
  await page.getByLabel("Mensagem para Geral", { exact: true }).fill(message);
  await page
    .getByRole("button", { name: "Enviar mensagem", exact: true })
    .click();
  const log = page.getByRole("log", { name: "Mensagens do canal Geral" });
  await expect(log).toContainText(message);
  await expect(log.locator("img")).toHaveCount(0);
  expect(await page.evaluate(() => "__qaInjected" in window)).toBe(false);
  await page.reload();
  await expect(
    page.getByRole("log", { name: "Mensagens do canal Geral" }),
  ).toContainText(message);
  expect(
    (await api<MessagesResponse>(request, user, "/messages")).messages,
  ).toHaveLength(1);
});

test("portal: convite é aceito e colaborador não recebe controles administrativos", async ({
  page,
  request,
  browser,
}) => {
  const admin = identity("invite-admin"),
    collaborator = identity("invite-colleague");
  await bootstrap(request, admin);
  await openPortal(page, admin, "settings");
  await page
    .getByRole("button", { name: "Criar convite", exact: true })
    .click();
  const inviteDialog = page.getByRole("dialog");
  await inviteDialog.getByLabel(/E-mail da pessoa/).fill(collaborator.email);
  await inviteDialog
    .getByLabel("Perfil", { exact: true })
    .selectOption("collaborator");
  await inviteDialog
    .getByRole("button", { name: "Gerar convite", exact: true })
    .click();
  const inviteLink = inviteDialog.getByLabel("Link do convite", {
    exact: true,
  });
  await expect(inviteLink).toBeVisible();
  const url = await inviteLink.inputValue();
  expect(new URL(url).pathname).toBe("/portal");
  const context = await browser.newContext({
    extraHTTPHeaders: headers(collaborator),
    reducedMotion: "reduce",
  });
  try {
    const invitedPage = await context.newPage();
    await invitedPage.goto(url);
    await expect(
      invitedPage.getByText(collaborator.email, { exact: true }),
    ).toBeVisible();
    await invitedPage
      .getByRole("button", { name: "Aceitar convite", exact: true })
      .click();
    await expect(invitedPage.locator("#portal-content")).toBeVisible();
    await expect(
      invitedPage.getByRole("button", {
        name: "Acessos e convites",
        exact: true,
      }),
    ).toHaveCount(0);
    await invitedPage.goto(`${origin}/portal#devices`);
    await expect(invitedPage.locator("#portal-content")).toBeVisible();
    await expect(
      invitedPage.getByRole("button", {
        name: /^(Novo|Cadastrar) equipamento$/,
      }),
    ).toHaveCount(0);
    const denied = await request.get("/api/v1/invitations", {
      headers: headers(collaborator),
    });
    expect(denied.status()).toBe(403);
    await invitedPage.goto(`${origin}/portal#settings`);
    await expect(
      invitedPage.getByRole("button", { name: "Criar convite", exact: true }),
    ).toHaveCount(0);
    expect(
      (await api<Session>(request, collaborator, "/session")).member?.role,
    ).toBe("collaborator");
  } finally {
    await context.close();
  }
});

test("saúde: busca, FAQ e observações locais não enviam nem persistem dados", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method()))
      writes.push(`${request.method()} ${request.url()}`);
  });
  await page.goto("/saude");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "CUIDAR DA ROTINA.",
  );
  await page.getByLabel("Buscar orientações", { exact: true }).fill("pausas");
  await expect(page.locator(".wt-health-topic-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Limpar busca", exact: true }).click();
  const checkbox = page.getByRole("checkbox", {
    name: "O mobiliário permite ajustes para a tarefa?",
    exact: true,
  });
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  const faq = page.locator(".wt-health-faq details").filter({
    hasText: "Existe um intervalo de pausa válido para todo trabalho?",
  });
  await faq.locator("summary").click();
  await expect(faq).toHaveAttribute("open", "");
  await expect(faq).toContainText("Não adote uma regra única");
  await page.reload();
  await expect(
    page.getByRole("checkbox", {
      name: "O mobiliário permite ajustes para a tarefa?",
      exact: true,
    }),
  ).not.toBeChecked();
  expect(writes).toEqual([]);
});

for (const width of [360, 768, 1280]) {
  test(`portal e saúde ${width}px: layouts sem overflow e navegação utilizável`, async ({
    page,
    request,
  }, testInfo) => {
    const user = identity(`layout-${width}`);
    await bootstrap(request, user, true);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await openPortal(page, user);
    for (const view of [
      "overview",
      "devices",
      "teams",
      "messages",
      "settings",
      "health",
    ]) {
      await page.goto(`/portal#${view}`);
      await expect(page.locator("#portal-content")).toBeVisible();
      await expect(page.locator(".wt-loading")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `overflow in ${view} at ${width}`,
      ).toBe(true);
    }
    await page.goto("/portal");
    await expect(page.locator("#portal-content")).toBeVisible();
    if (width === 360) {
      const menu = page.getByRole("button", {
        name: "Abrir navegação do portal",
        exact: true,
      });
      await menu.click();
      await page
        .getByRole("navigation", { name: "Navegação do portal" })
        .getByRole("button", { name: "Equipamentos", exact: true })
        .click();
      await expect(page).toHaveURL(/#devices$/);
      await expect(menu).toHaveAttribute("aria-expanded", "false");
    }
    await page.screenshot({
      path: testInfo.outputPath(`portal-${width}.png`),
      fullPage: true,
    });
    await page.goto("/saude");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`health-${width}.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}
