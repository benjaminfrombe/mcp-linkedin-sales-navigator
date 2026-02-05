/**
 * Authentication module for LinkedIn Sales Navigator.
 *
 * Supports:
 * - Existing browser session via CDP (Chrome DevTools Protocol)
 * - Cookie-based session restoration
 * - User data directory with existing login
 *
 * ⚠️ This module does NOT store or handle credentials directly.
 * Authentication relies on an already-authenticated browser session.
 */

import { type Page, type BrowserContext } from "playwright";
import { AUTH_SELECTORS, URLS, WAIT_CONDITIONS } from "./selectors.js";
import type { AuthConfig } from "../types/index.js";

/**
 * Check if the current page has an active LinkedIn Sales Navigator session.
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto(URLS.HOME, {
      waitUntil: "domcontentloaded",
      timeout: WAIT_CONDITIONS.PROFILE_LOAD_TIMEOUT,
    });

    // Check for Sales Navigator header (indicates logged-in state)
    const header = await page.$(AUTH_SELECTORS.SALES_NAV_HEADER);
    if (header) return true;

    // Check if we were redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl.includes("/authwall")) {
      return false;
    }

    // Check for profile icon as another indicator
    const profileIcon = await page.$(AUTH_SELECTORS.PROFILE_ICON);
    return profileIcon !== null;
  } catch {
    return false;
  }
}

/**
 * Restore a LinkedIn session from exported cookies.
 */
export async function restoreSessionFromCookies(
  context: BrowserContext,
  cookiesJson: string
): Promise<void> {
  const cookies = JSON.parse(cookiesJson);

  if (!Array.isArray(cookies)) {
    throw new Error("Cookies must be a JSON array of cookie objects");
  }

  // Validate cookie format
  for (const cookie of cookies) {
    if (!cookie.name || !cookie.domain) {
      throw new Error(
        "Each cookie must have at least 'name' and 'domain' fields"
      );
    }
  }

  await context.addCookies(cookies);
}

/**
 * Wait for the user to manually complete authentication.
 * Useful when 2FA or CAPTCHA is required.
 */
export async function waitForManualAuth(
  page: Page,
  timeoutMs: number = 120000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const authenticated = await isAuthenticated(page);
    if (authenticated) return true;

    // Wait 2 seconds before checking again
    await page.waitForTimeout(2000);
  }

  return false;
}

/**
 * Navigate to Sales Navigator and verify access.
 */
export async function navigateToSalesNavigator(page: Page): Promise<boolean> {
  await page.goto(URLS.HOME, {
    waitUntil: "networkidle",
    timeout: WAIT_CONDITIONS.SEARCH_RESULTS_TIMEOUT,
  });

  // Wait for the page to settle
  await page.waitForTimeout(WAIT_CONDITIONS.NAVIGATION_DELAY);

  return isAuthenticated(page);
}

/**
 * Validate the authentication configuration.
 */
export function validateAuthConfig(config: AuthConfig): void {
  switch (config.method) {
    case "cookies":
      if (!config.cookiesPath) {
        throw new Error(
          "cookiesPath is required for cookie-based authentication"
        );
      }
      break;
    case "cdp":
      if (!config.cdpEndpoint) {
        throw new Error(
          "cdpEndpoint is required for CDP-based authentication"
        );
      }
      break;
    case "session":
      if (!config.userDataDir) {
        throw new Error(
          "userDataDir is required for session-based authentication"
        );
      }
      break;
    default:
      throw new Error(`Unknown auth method: ${config.method}`);
  }
}
