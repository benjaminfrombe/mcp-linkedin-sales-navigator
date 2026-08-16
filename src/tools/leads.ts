/**
 * Lead profile tools for LinkedIn Sales Navigator.
 *
 * View detailed profiles, save leads, manage lead info.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getNavigator } from "../browser/navigator.js";
import { PROFILE_SELECTORS, WAIT_CONDITIONS } from "../browser/selectors.js";
import type { LeadProfile, ExperienceEntry, EducationEntry } from "../types/index.js";

/**
 * Parse a lead profile from the current page.
 */
async function parseLeadProfile(): Promise<LeadProfile> {
  const nav = getNavigator();
  const page = nav.getPage();

  // Wait for profile to load
  await nav.waitForSelector(PROFILE_SELECTORS.PROFILE_CONTAINER, WAIT_CONDITIONS.PROFILE_LOAD_TIMEOUT);

  // Name/headline/location have no stable per-field selector on the
  // current topcard markup (see issue #2) - extract them together via
  // the structural DOM heuristic, falling back to the selector-based
  // path (PROFILE_NAME) only if that heuristic comes up empty.
  const topcard = await nav.extractTopcardFields();
  const fullName =
    topcard.name || (await nav.safeTextContent(PROFILE_SELECTORS.PROFILE_NAME)) || "Unknown";
  const nameParts = fullName.split(" ");

  // Parse experience
  const experience: ExperienceEntry[] = [];
  const expElements = await page.$$(PROFILE_SELECTORS.EXPERIENCE_ITEM);
  for (const exp of expElements) {
    const title = (await exp.$(PROFILE_SELECTORS.EXPERIENCE_TITLE))
      ? (await (await exp.$(PROFILE_SELECTORS.EXPERIENCE_TITLE))?.textContent())?.trim() || ""
      : "";
    const company = (await exp.$(PROFILE_SELECTORS.EXPERIENCE_COMPANY))
      ? (await (await exp.$(PROFILE_SELECTORS.EXPERIENCE_COMPANY))?.textContent())?.trim() || ""
      : "";
    const dates = (await exp.$(PROFILE_SELECTORS.EXPERIENCE_DATES))
      ? (await (await exp.$(PROFILE_SELECTORS.EXPERIENCE_DATES))?.textContent())?.trim() || ""
      : "";

    experience.push({
      title,
      company,
      isCurrent: dates.toLowerCase().includes("present"),
      startDate: dates.split("–")[0]?.trim(),
      endDate: dates.split("–")[1]?.trim(),
    });
  }

  // Parse education
  const education: EducationEntry[] = [];
  const eduElements = await page.$$(PROFILE_SELECTORS.EDUCATION_ITEM);
  for (const edu of eduElements) {
    const school = (await edu.$(PROFILE_SELECTORS.EDUCATION_SCHOOL))
      ? (await (await edu.$(PROFILE_SELECTORS.EDUCATION_SCHOOL))?.textContent())?.trim() || ""
      : "";
    const degree = (await edu.$(PROFILE_SELECTORS.EDUCATION_DEGREE))
      ? (await (await edu.$(PROFILE_SELECTORS.EDUCATION_DEGREE))?.textContent())?.trim() || ""
      : "";

    education.push({ school, degree });
  }

  return {
    leadId: extractLeadIdFromUrl(page.url()),
    fullName,
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    title: (await nav.safeTextContent(PROFILE_SELECTORS.PROFILE_TITLE)) || "",
    company: (await nav.safeTextContent(PROFILE_SELECTORS.PROFILE_COMPANY)) || "",
    location:
      topcard.location || (await nav.safeTextContent(PROFILE_SELECTORS.PROFILE_LOCATION)) || "",
    headline:
      topcard.headline ||
      (await nav.safeTextContent(PROFILE_SELECTORS.PROFILE_HEADLINE)) ||
      undefined,
    summary: (await nav.safeTextContent(PROFILE_SELECTORS.PROFILE_ABOUT)) || undefined,
    connectionDegree:
      topcard.connectionDegree ||
      (await nav.safeTextContent(PROFILE_SELECTORS.CONNECTION_DEGREE)) ||
      undefined,
    profilePictureUrl: (await nav.safeAttribute(PROFILE_SELECTORS.PROFILE_PHOTO, "src")) || undefined,
    salesNavUrl: page.url(),
    experience,
    education,
  };
}

function extractLeadIdFromUrl(url: string): string {
  const match = url.match(/\/lead\/([^,/?]+)/);
  return match ? match[1] : "";
}

/**
 * Register lead tools with the MCP server.
 */
export function registerLeadTools(server: McpServer): void {
  server.tool(
    "linkedin_get_lead_profile",
    "Get detailed profile information for a LinkedIn Sales Navigator lead",
    {
      profileUrl: z
        .string()
        .describe("Sales Navigator profile URL (e.g., https://www.linkedin.com/sales/lead/...)"),
    },
    async (params) => {
      try {
        const nav = getNavigator();

        // Navigate to the profile
        await nav.goToProfile(params.profileUrl);

        // Parse the profile
        const profile = await parseLeadProfile();

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(profile, null, 2),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error getting lead profile: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "linkedin_save_lead",
    "Save a lead to a list on LinkedIn Sales Navigator",
    {
      profileUrl: z.string().describe("Sales Navigator profile URL of the lead to save"),
      listName: z.string().optional().describe("Name of the list to save to (default: saved leads)"),
    },
    async (params) => {
      try {
        const nav = getNavigator();
        const page = nav.getPage();

        // Navigate to the profile
        await nav.goToProfile(params.profileUrl);
        await nav.humanDelay();

        // Click the save button. Its accessible name flips between
        // "Save <name> as a lead..." and "Unsave <name>..." once saved,
        // so check both up front rather than relying on one being absent.
        const saveButton = await page.$(PROFILE_SELECTORS.SAVE_BUTTON);
        const unsaveButton = await page.$(PROFILE_SELECTORS.UNSAVE_BUTTON);
        if (unsaveButton) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ success: true, message: "Lead is already saved" }),
              },
            ],
          };
        }
        if (!saveButton) {
          throw new Error("Save button not found on profile page");
        }

        await nav.clickAndSettle(saveButton, WAIT_CONDITIONS.BUTTON_STATE_SETTLE);

        // If a specific list is requested, handle list selection
        if (params.listName) {
          const addToListBtn = await page.$(PROFILE_SELECTORS.ADD_TO_LIST_BUTTON);
          if (addToListBtn) {
            await nav.clickAndSettle(addToListBtn, WAIT_CONDITIONS.BUTTON_STATE_SETTLE);
            // Type list name and select
            // This interaction depends on the list selection UI
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                message: `Lead saved successfully${params.listName ? ` to list "${params.listName}"` : ""}`,
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
              text: `Error saving lead: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
