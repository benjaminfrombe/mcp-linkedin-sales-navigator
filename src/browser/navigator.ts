/**
 * Browser navigation controller for LinkedIn Sales Navigator.
 *
 * Manages the Playwright browser instance and provides
 * high-level methods for interacting with Sales Navigator pages.
 */

import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from "playwright";
import {
  isAuthenticated,
  restoreSessionFromCookies,
  navigateToSalesNavigator,
} from "./auth.js";
import { URLS, WAIT_CONDITIONS } from "./selectors.js";
import type { BrowserConfig, AuthConfig } from "../types/index.js";
import { readFile } from "node:fs/promises";

export class SalesNavigator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;

  constructor(config: Partial<BrowserConfig> = {}) {
    this.config = {
      headless: false,
      viewportWidth: 1280,
      viewportHeight: 900,
      navigationTimeout: 30000,
      actionTimeout: 10000,
      ...config,
    };
  }

  /**
   * Initialize the browser and connect to Sales Navigator.
   */
  async initialize(authConfig: AuthConfig): Promise<void> {
    if (authConfig.method === "cdp" && authConfig.cdpEndpoint) {
      // Connect to an existing browser via CDP
      this.browser = await chromium.connectOverCDP(authConfig.cdpEndpoint);
      const contexts = this.browser.contexts();
      this.context = contexts[0] || (await this.browser.newContext());
    } else if (authConfig.method === "session" && authConfig.userDataDir) {
      // Launch with existing user data directory
      this.context = await chromium.launchPersistentContext(
        authConfig.userDataDir,
        {
          headless: this.config.headless,
          viewport: {
            width: this.config.viewportWidth!,
            height: this.config.viewportHeight!,
          },
        }
      );
    } else {
      // Default: launch fresh browser
      this.browser = await chromium.launch({
        headless: this.config.headless,
      });
      this.context = await this.browser.newContext({
        viewport: {
          width: this.config.viewportWidth!,
          height: this.config.viewportHeight!,
        },
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      });
    }

    // Restore cookies if provided
    if (authConfig.method === "cookies" && authConfig.cookiesPath) {
      const cookiesJson = await readFile(authConfig.cookiesPath, "utf-8");
      await restoreSessionFromCookies(this.context, cookiesJson);
    }

    // Get or create a page
    const pages = this.context.pages();
    this.page = pages[0] || (await this.context.newPage());

    // Set default timeouts
    this.page.setDefaultTimeout(this.config.actionTimeout!);
    this.page.setDefaultNavigationTimeout(this.config.navigationTimeout!);

    // Verify authentication
    const isAuthed = await navigateToSalesNavigator(this.page);
    if (!isAuthed) {
      throw new Error(
        "Not authenticated to LinkedIn Sales Navigator. " +
          "Please ensure you have an active LinkedIn session. " +
          "Use cookie-based auth or connect via CDP to an authenticated browser."
      );
    }
  }

  /**
   * Get the active page instance.
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error(
        "Browser not initialized. Call initialize() first."
      );
    }
    return this.page;
  }

  /**
   * Get the browser context.
   */
  getContext(): BrowserContext {
    if (!this.context) {
      throw new Error(
        "Browser not initialized. Call initialize() first."
      );
    }
    return this.context;
  }

  /**
   * Navigate to a Sales Navigator URL.
   */
  async navigateTo(url: string): Promise<void> {
    const page = this.getPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await this.humanDelay();
  }

  /**
   * Check if still authenticated.
   */
  async checkAuth(): Promise<boolean> {
    return isAuthenticated(this.getPage());
  }

  /**
   * Add a random human-like delay between actions.
   * Helps avoid detection and rate limiting.
   */
  async humanDelay(
    min: number = WAIT_CONDITIONS.MIN_HUMAN_DELAY,
    max: number = WAIT_CONDITIONS.MAX_HUMAN_DELAY
  ): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.getPage().waitForTimeout(delay);
  }

  /**
   * Safely extract text content from an element.
   */
  async safeTextContent(selector: string): Promise<string | null> {
    try {
      const page = this.getPage();
      const element = await page.$(selector);
      if (!element) return null;
      const text = await element.textContent();
      return text?.trim() || null;
    } catch {
      return null;
    }
  }

  /**
   * Safely extract an attribute from an element.
   */
  async safeAttribute(
    selector: string,
    attribute: string
  ): Promise<string | null> {
    try {
      const page = this.getPage();
      const element = await page.$(selector);
      if (!element) return null;
      return element.getAttribute(attribute);
    } catch {
      return null;
    }
  }

  /**
   * Wait for a selector to appear on the page.
   */
  async waitForSelector(
    selector: string,
    timeout?: number
  ): Promise<boolean> {
    try {
      await this.getPage().waitForSelector(selector, {
        timeout: timeout || this.config.actionTimeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to the search page.
   */
  async goToSearch(): Promise<void> {
    await this.navigateTo(URLS.SEARCH_LEADS);
    await this.getPage().waitForTimeout(WAIT_CONDITIONS.NAVIGATION_DELAY);
  }

  /**
   * Navigate to lead lists.
   */
  async goToLists(): Promise<void> {
    await this.navigateTo(URLS.LEAD_LISTS);
    await this.getPage().waitForTimeout(WAIT_CONDITIONS.NAVIGATION_DELAY);
  }

  /**
   * Navigate to a specific lead profile.
   */
  async goToProfile(profileUrl: string): Promise<void> {
    // Ensure it's a Sales Navigator URL
    if (!profileUrl.includes("/sales/")) {
      throw new Error("URL must be a Sales Navigator profile URL");
    }
    await this.navigateTo(profileUrl);
    await this.getPage().waitForTimeout(WAIT_CONDITIONS.NAVIGATION_DELAY);
  }

  /**
   * Close the browser and clean up resources.
   */
  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close().catch(() => {});
        this.page = null;
      }
      if (this.context) {
        await this.context.close().catch(() => {});
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close().catch(() => {});
        this.browser = null;
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Singleton instance for the MCP server.
 */
let navigatorInstance: SalesNavigator | null = null;

export function getNavigator(): SalesNavigator {
  if (!navigatorInstance) {
    navigatorInstance = new SalesNavigator();
  }
  return navigatorInstance;
}

export async function initializeNavigator(
  browserConfig: Partial<BrowserConfig>,
  authConfig: AuthConfig
): Promise<SalesNavigator> {
  const nav = new SalesNavigator(browserConfig);
  await nav.initialize(authConfig);
  navigatorInstance = nav;
  return nav;
}

export async function closeNavigator(): Promise<void> {
  if (navigatorInstance) {
    await navigatorInstance.close();
    navigatorInstance = null;
  }
}
