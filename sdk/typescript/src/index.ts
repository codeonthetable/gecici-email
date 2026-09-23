export interface InboxDetails {
  address: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  ttlSeconds: number;
}

export interface SmartSummary {
  otpCode: string | null;
  otpContext: string | null;
  verificationLink: string | null;
  actionText: string | null;
  actionType: string;
  cleanSummary: string;
  senderDomain: string;
  isAutomated: boolean;
}

export interface EmailMessage {
  id: string;
  messageId: string;
  from: {
    name: string;
    address: string;
  };
  to: string[];
  subject: string;
  date: string;
  text?: string;
  html?: string;
  smartSummary: SmartSummary;
  read: boolean;
  receivedAt: number;
}

export class GeciciEmail {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://gecici.email/api/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Creates a new randomized disposable inbox
   */
  async createInbox(domain: string = 'gecici.email'): Promise<InboxDetails> {
    const res = await fetch(`${this.baseUrl}/inbox/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    });
    if (!res.ok) throw new Error(`Failed to create inbox: ${res.statusText}`);
    const data = (await res.json()) as { success: boolean; inbox: InboxDetails };
    return data.inbox;
  }

  /**
   * Creates a custom named inbox (e.g. ahmet@gecici.email)
   */
  async createCustomInbox(prefix: string, domain: string = 'gecici.email'): Promise<InboxDetails> {
    const res = await fetch(`${this.baseUrl}/inbox/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, domain }),
    });
    if (!res.ok) throw new Error(`Failed to create custom inbox: ${res.statusText}`);
    const data = (await res.json()) as { success: boolean; inbox: InboxDetails };
    return data.inbox;
  }

  /**
   * Lists all messages in the inbox
   */
  async getMessages(address: string): Promise<EmailMessage[]> {
    const res = await fetch(`${this.baseUrl}/inbox/${encodeURIComponent(address)}/messages`);
    if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
    const data = (await res.json()) as { success: boolean; messages: EmailMessage[] };
    return data.messages;
  }

  /**
   * AI Agent: Waits until an incoming email arrives and returns the extracted 4-8 digit OTP code
   */
  async waitForOtp(address: string, timeoutSeconds: number = 30): Promise<string | null> {
    const res = await fetch(`${this.baseUrl}/inbox/${encodeURIComponent(address)}/otp?timeout=${timeoutSeconds * 1000}`);
    if (res.status === 408) return null;
    if (!res.ok) throw new Error(`Error waiting for OTP: ${res.statusText}`);
    const data = (await res.json()) as { success: boolean; otp: string | null };
    return data.otp;
  }

  /**
   * AI Agent: Waits until an incoming email arrives and returns the Magic / Verification Link
   */
  async waitForMagicLink(address: string, timeoutSeconds: number = 30): Promise<string | null> {
    const res = await fetch(`${this.baseUrl}/inbox/${encodeURIComponent(address)}/links?timeout=${timeoutSeconds * 1000}`);
    if (res.status === 408) return null;
    if (!res.ok) throw new Error(`Error waiting for Magic Link: ${res.statusText}`);
    const data = (await res.json()) as { success: boolean; verificationLink: string | null };
    return data.verificationLink;
  }

  /**
   * Returns a high-signal clean text summary for LLM prompt context
   */
  async getAiSummary(address: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/inbox/${encodeURIComponent(address)}/ai-summary`);
    if (!res.ok) throw new Error(`Error fetching AI summary: ${res.statusText}`);
    const data = (await res.json()) as { success: boolean; latestSummary?: string; summary?: string };
    return data.latestSummary || data.summary || '';
  }

  /**
   * Deletes the inbox immediately
   */
  async deleteInbox(address: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/inbox/${encodeURIComponent(address)}`, {
      method: 'DELETE',
    });
    return res.ok;
  }
}
