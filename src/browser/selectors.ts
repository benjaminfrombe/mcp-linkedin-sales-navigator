/**
 * CSS and XPath selectors for LinkedIn Sales Navigator pages.
 *
 * ⚠️ LinkedIn frequently updates their DOM structure.
 * These selectors may need updating. When they break,
 * use the browser inspector to find updated selectors.
 *
 * Last verified: 2025-01 (Sales Navigator UI v3)
 */

export const URLS = {
  BASE: "https://www.linkedin.com/sales",
  SEARCH_LEADS: "https://www.linkedin.com/sales/search/people",
  SEARCH_ACCOUNTS: "https://www.linkedin.com/sales/search/company",
  LEAD_LISTS: "https://www.linkedin.com/sales/lists/people",
  ACCOUNT_LISTS: "https://www.linkedin.com/sales/lists/company",
  HOME: "https://www.linkedin.com/sales/home",
  INBOX: "https://www.linkedin.com/sales/inbox",
  LOGIN: "https://www.linkedin.com/login",
} as const;

export const AUTH_SELECTORS = {
  /** Login page elements */
  USERNAME_INPUT: "#username",
  PASSWORD_INPUT: "#password",
  LOGIN_BUTTON: 'button[type="submit"]',
  /** Verification/challenge selectors */
  CHALLENGE_PAGE: "#challenge",
  /** Logged-in indicators */
  SALES_NAV_HEADER: ".global-header",
  PROFILE_ICON: ".global-header__me-photo",
} as const;

export const SEARCH_SELECTORS = {
  /** Search input and controls */
  KEYWORD_INPUT: 'input[placeholder*="Search"]',
  SEARCH_BUTTON: 'button[data-action="search"]',

  /** Filter panel */
  FILTER_PANEL: ".search-filters-bar",
  FILTER_TITLE: 'button[data-filter="CURRENT_TITLE"]',
  FILTER_COMPANY: 'button[data-filter="CURRENT_COMPANY"]',
  FILTER_LOCATION: 'button[data-filter="REGION"]',
  FILTER_INDUSTRY: 'button[data-filter="INDUSTRY"]',
  FILTER_SENIORITY: 'button[data-filter="SENIORITY_LEVEL"]',
  FILTER_COMPANY_SIZE: 'button[data-filter="COMPANY_HEADCOUNT"]',
  FILTER_FUNCTION: 'button[data-filter="FUNCTION"]',
  FILTER_INPUT: ".search-filter-typeahead input",
  FILTER_APPLY: 'button[data-action="apply"]',

  /** Results list */
  RESULTS_CONTAINER: ".search-results__result-list",
  RESULT_ITEM: "li.search-results__result-item",
  RESULT_NAME: ".result-lockup__name a",
  RESULT_TITLE: ".result-lockup__highlight-keyword",
  RESULT_COMPANY: ".result-lockup__position-company a",
  RESULT_LOCATION: ".result-lockup__misc-item",
  RESULT_LINK: ".result-lockup__name a",

  /** Pagination */
  PAGINATION_CONTAINER: ".search-results__pagination",
  PAGINATION_NEXT: 'button[aria-label="Next"]',
  PAGINATION_PREV: 'button[aria-label="Previous"]',
  TOTAL_RESULTS: ".search-results__result-count",

  /** No results */
  NO_RESULTS: ".search-results__no-results",
} as const;

export const PROFILE_SELECTORS = {
  /** Lead profile page */
  PROFILE_CONTAINER: ".profile-topcard",
  PROFILE_NAME: ".profile-topcard-person-entity__name",
  PROFILE_TITLE: ".profile-topcard__summary-position",
  PROFILE_COMPANY: ".profile-topcard__summary-company",
  PROFILE_LOCATION: ".profile-topcard__summary-location",
  PROFILE_HEADLINE: ".profile-topcard__headline",
  PROFILE_ABOUT: ".profile-topcard__summary-content",
  PROFILE_PHOTO: ".profile-topcard-person-entity__image img",

  /** Connection info */
  CONNECTION_DEGREE: ".profile-topcard__connection-degree",
  SHARED_CONNECTIONS: ".profile-topcard__shared-connections",

  /** Action buttons */
  SAVE_BUTTON: 'button[data-action="save-lead"]',
  UNSAVE_BUTTON: 'button[data-action="unsave-lead"]',
  SEND_INMAIL_BUTTON: 'button[data-action="compose-inmail"]',
  ADD_TO_LIST_BUTTON: 'button[data-action="add-to-list"]',

  /** Experience section */
  EXPERIENCE_SECTION: ".profile-experience",
  EXPERIENCE_ITEM: ".profile-experience__card",
  EXPERIENCE_TITLE: ".profile-experience__title",
  EXPERIENCE_COMPANY: ".profile-experience__company",
  EXPERIENCE_DATES: ".profile-experience__dates",

  /** Education section */
  EDUCATION_SECTION: ".profile-education",
  EDUCATION_ITEM: ".profile-education__card",
  EDUCATION_SCHOOL: ".profile-education__school",
  EDUCATION_DEGREE: ".profile-education__degree",
} as const;

export const LIST_SELECTORS = {
  /** Lead lists page */
  LISTS_CONTAINER: ".lists-container",
  LIST_ITEM: ".lists-nav__list-item",
  LIST_NAME: ".lists-nav__list-name",
  LIST_COUNT: ".lists-nav__list-count",
  CREATE_LIST_BUTTON: 'button[data-action="create-list"]',
  LIST_NAME_INPUT: 'input[data-action="list-name"]',
  LIST_SAVE_BUTTON: 'button[data-action="save-list"]',

  /** List detail view */
  LIST_LEADS: ".list-detail__results",
  LIST_LEAD_ITEM: ".list-detail__result-item",
} as const;

export const INMAIL_SELECTORS = {
  /** InMail compose modal */
  COMPOSE_MODAL: ".compose-form",
  SUBJECT_INPUT: 'input[name="subject"]',
  BODY_INPUT: 'textarea[name="body"], .compose-form__message-field',
  SEND_BUTTON: 'button[data-action="send"]',
  CANCEL_BUTTON: 'button[data-action="cancel"]',

  /** InMail credits */
  CREDITS_INDICATOR: ".inmail-credits-indicator",
  CREDITS_COUNT: ".inmail-credits-indicator__count",

  /** Confirmation */
  SEND_SUCCESS: ".compose-form__success",
  SEND_ERROR: ".compose-form__error",
} as const;

/**
 * Wait conditions for page loads
 */
export const WAIT_CONDITIONS = {
  /** Time to wait after navigation (ms) */
  NAVIGATION_DELAY: 2000,
  /** Time to wait between actions to appear human (ms) */
  ACTION_DELAY: 1000,
  /** Time to wait for search results to load (ms) */
  SEARCH_RESULTS_TIMEOUT: 15000,
  /** Time to wait for profile to load (ms) */
  PROFILE_LOAD_TIMEOUT: 10000,
  /** Minimum random delay between actions (ms) */
  MIN_HUMAN_DELAY: 500,
  /** Maximum random delay between actions (ms) */
  MAX_HUMAN_DELAY: 2000,
} as const;
