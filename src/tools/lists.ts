/**
 * Lead list management tools for LinkedIn Sales Navigator.
 *
 * Create, view, and manage lead lists.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getNavigator } from "../browser/navigator.js";
import { LIST_SELECTORS, WAIT_CONDITIONS } from "../browser/selectors.js";
import type { LeadList } from "../types/index.js";

/**
 * Parse lead lists from the lists page.
 */
async function parseLeadLists(): Promise<LeadList[]> {
  const nav = getNavigator();
  const page = nav.getPage();

  await nav.waitForSelector(LIST_SELECTORS.LISTS_CONTAINER, WAIT_CONDITIONS.SEARCH_RESULTS_TIMEOUT);

  const listElements = await page.$$(LIST_SELECTORS.LIST_ITEM);
  const lists: LeadList[] = [];

  for (const listEl of listElements) {
    try {
      const nameEl = await listEl.$(LIST_SELECTORS.LIST_NAME);
      const countEl = await listEl.$(LIST_SELECTORS.LIST_COUNT);

      const name = (await nameEl?.textContent())?.trim() || "Unnamed List";
      const countText = (await countEl?.textContent())?.trim() || "0";
      const leadCount = parseInt(countText.replace(/[^0-9]/g, ""), 10) || 0;

      // Extract list ID from link or data attribute
      const linkEl = await listEl.$("a");
      const href = await linkEl?.getAttribute("href");
      const id = href?.match(/\/lists\/people\/([^/?]+)/)?.[1] || "";

      lists.push({ id, name, leadCount });
    } catch {
      continue;
    }
  }

  return lists;
}

/**
 * Register list tools with the MCP server.
 */
export function registerListTools(server: McpServer): void {
  server.tool(
    "linkedin_list_lead_lists",
    "List all lead lists in LinkedIn Sales Navigator",
    {},
    async () => {
      try {
        const nav = getNavigator();

        // Navigate to lists page
        await nav.goToLists();

        // Parse lists
        const lists = await parseLeadLists();

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ lists, total: lists.length }, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing lead lists: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "linkedin_create_lead_list",
    "Create a new lead list in LinkedIn Sales Navigator",
    {
      name: z.string().describe("Name for the new lead list"),
    },
    async (params) => {
      try {
        const nav = getNavigator();
        const page = nav.getPage();

        // Navigate to lists page
        await nav.goToLists();
        await nav.humanDelay();

        // Click create list button
        const createButton = await page.$(LIST_SELECTORS.CREATE_LIST_BUTTON);
        if (!createButton) {
          throw new Error("Create list button not found");
        }
        await createButton.click();
        await nav.humanDelay();

        // Enter list name
        const nameInput = await page.$(LIST_SELECTORS.LIST_NAME_INPUT);
        if (!nameInput) {
          throw new Error("List name input not found");
        }
        await nameInput.fill(params.name);
        await nav.humanDelay();

        // Save list
        const saveButton = await page.$(LIST_SELECTORS.LIST_SAVE_BUTTON);
        if (!saveButton) {
          throw new Error("Save list button not found");
        }
        await saveButton.click();
        await nav.humanDelay(1000, 2000);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                message: `Lead list "${params.name}" created successfully`,
              }),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating lead list: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
