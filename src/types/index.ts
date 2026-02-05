/**
 * Type definitions for LinkedIn Sales Navigator MCP Server
 */

export interface LeadProfile {
  /** LinkedIn member ID or Sales Navigator lead ID */
  leadId: string;
  /** Full name */
  fullName: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Current job title */
  title: string;
  /** Current company name */
  company: string;
  /** Geographic location */
  location: string;
  /** Industry */
  industry?: string;
  /** Profile headline */
  headline?: string;
  /** Profile summary/about section */
  summary?: string;
  /** Profile picture URL */
  profilePictureUrl?: string;
  /** Sales Navigator profile URL */
  salesNavUrl: string;
  /** Regular LinkedIn profile URL */
  linkedinUrl?: string;
  /** Connection degree (1st, 2nd, 3rd) */
  connectionDegree?: string;
  /** Number of shared connections */
  sharedConnections?: number;
  /** Whether the lead is saved */
  isSaved?: boolean;
  /** Tags/labels applied to the lead */
  tags?: string[];
  /** Last activity on LinkedIn */
  lastActivity?: string;
  /** Experience entries */
  experience?: ExperienceEntry[];
  /** Education entries */
  education?: EducationEntry[];
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface EducationEntry {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface SearchFilters {
  /** Keywords to search for */
  keywords?: string;
  /** Job title filter */
  title?: string;
  /** Company name filter */
  company?: string;
  /** Geographic location filter */
  location?: string;
  /** Industry filter */
  industry?: string;
  /** Seniority level (e.g., "VP", "Director", "Manager") */
  seniorityLevel?: string;
  /** Company headcount range (e.g., "51-200", "201-500") */
  companySize?: string;
  /** Connection degree filter (1, 2, 3) */
  connectionDegree?: number;
  /** Function filter (e.g., "Sales", "Engineering") */
  function?: string;
  /** Years in current position */
  yearsInCurrentPosition?: string;
  /** Years at current company */
  yearsAtCurrentCompany?: string;
  /** Page number for pagination (1-indexed) */
  page?: number;
}

export interface SearchResult {
  leads: LeadProfile[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

export interface LeadList {
  /** List ID */
  id: string;
  /** List name */
  name: string;
  /** Number of leads in the list */
  leadCount: number;
  /** Creation date */
  createdAt?: string;
  /** Last modified date */
  updatedAt?: string;
}

export interface InMailMessage {
  /** Recipient lead ID */
  recipientLeadId: string;
  /** InMail subject line */
  subject: string;
  /** InMail body text */
  body: string;
}

export interface InMailResult {
  success: boolean;
  /** Message ID if sent successfully */
  messageId?: string;
  /** Error message if failed */
  error?: string;
  /** Remaining InMail credits */
  remainingCredits?: number;
}

export interface ExportOptions {
  /** List ID to export, or "search" for current search results */
  source: string;
  /** Export format */
  format: "json" | "csv";
  /** Fields to include in export */
  fields?: (keyof LeadProfile)[];
  /** Maximum number of leads to export */
  limit?: number;
}

export interface BrowserConfig {
  /** Connect to an existing browser via CDP endpoint */
  cdpEndpoint?: string;
  /** Path to browser user data directory (for existing sessions) */
  userDataDir?: string;
  /** Whether to run in headless mode */
  headless?: boolean;
  /** Viewport width */
  viewportWidth?: number;
  /** Viewport height */
  viewportHeight?: number;
  /** Navigation timeout in milliseconds */
  navigationTimeout?: number;
  /** Action timeout in milliseconds */
  actionTimeout?: number;
}

export interface AuthConfig {
  /** Authentication method */
  method: "session" | "cookies" | "cdp";
  /** Path to cookies file (JSON format) */
  cookiesPath?: string;
  /** CDP endpoint URL for connecting to existing browser */
  cdpEndpoint?: string;
  /** User data directory path with existing LinkedIn session */
  userDataDir?: string;
}
