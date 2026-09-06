import { ThemeScope } from "@lenso/ui/theme-scope";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import "@lenso/tokens/styles.css";
import "@lenso/ui/styles.css";
import { AppManagementProvider } from "../apps/app-management-context";
import { PluginAgentWorkbenchProvider } from "./plugin-agent-workbench-context";
import { PluginWorkbenchPage } from "./plugin-workbench-page";

test("manages non-Agent Apps without an Agent identity provider and keeps all scopes isolated", async () => {
  const rootRoute = createRootRoute({ component: Outlet });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      createRoute({
        getParentRoute: () => rootRoute,
        path: "/plugins",
        component: PluginWorkbenchPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: "/plugins/$agentId/$packageId/$instanceKey",
        component: () => <h1>Plugin configuration</h1>,
      }),
    ]),
    history: createMemoryHistory({ initialEntries: ["/plugins"] }),
  });
  await router.load();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() =>
      root.render(
        <ThemeScope>
          <QueryClientProvider client={client}>
            <AppManagementProvider>
              <PluginAgentWorkbenchProvider>
                <RouterProvider router={router} />
              </PluginAgentWorkbenchProvider>
            </AppManagementProvider>
          </QueryClientProvider>
        </ThemeScope>
      )
    );
    await expect
      .element(page.getByRole("tab", { name: "App plugins", exact: true }))
      .toHaveAttribute("aria-selected", "true");
    await page
      .getByRole("combobox", { name: "Manage App" })
      .selectOptions("support");
    const plugin = page
      .getByRole("link")
      .filter({ hasText: "example.support.tickets/default" });
    await expect
      .element(plugin)
      .toHaveAttribute(
        "href",
        "/plugins/support/example.support.tickets/default"
      );
    await page
      .getByRole("tab", { name: "Management Agent", exact: true })
      .click();
    await expect
      .element(
        page.getByRole("link").filter({ hasText: "lenso.agent.loop/agent" })
      )
      .toHaveAttribute("href", "/plugins/console/lenso.agent.loop/agent");
    await page
      .getByRole("tab", { name: "Console extensions", exact: true })
      .click();
    await expect
      .element(
        page.getByRole("heading", { name: "Plugin management unavailable" })
      )
      .toBeVisible();
    await expect.element(plugin).not.toBeInTheDocument();
    await page.getByRole("tab", { name: "App plugins", exact: true }).click();
    await expect
      .element(plugin)
      .toHaveAttribute(
        "href",
        "/plugins/support/example.support.tickets/default"
      );
    await page
      .getByRole("searchbox", { name: "Search plugins" })
      .fill("missing-plugin");
    await expect
      .element(page.getByRole("heading", { name: "No matching Plugins" }))
      .toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await plugin.click();
    await expect
      .element(page.getByRole("heading", { name: "Plugin configuration" }))
      .toBeVisible();
  } finally {
    flushSync(() => root.unmount());
    client.clear();
    container.remove();
  }
});
