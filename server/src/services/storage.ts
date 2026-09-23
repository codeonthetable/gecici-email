import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import { Inbox, StoredEmail } from '../types';

export class StorageService {
  private inboxes: Map<string, Inbox> = new Map();
  private emails: Map<string, StoredEmail[]> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private defaultTtlMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private defaultDomain: string;

  constructor(defaultDomain: string = 'gecici.email', defaultTtlMinutes: number = 60) {
    this.defaultDomain = defaultDomain.toLowerCase();
    this.defaultTtlMs = defaultTtlMinutes * 60 * 1000;
    this.eventEmitter.setMaxListeners(1000); // Support high concurrent agent / user streams

    // Run periodic TTL cleanup every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60 * 1000);
  }

  /**
   * Generates a new random temporary email inbox
   */
  public createInbox(customPrefix?: string, domain?: string): Inbox {
    const selectedDomain = (domain || this.defaultDomain).toLowerCase();
    
    let prefix = customPrefix ? this.sanitizePrefix(customPrefix) : '';
    if (!prefix) {
      // e.g. "sparkle_8492" or "swift_9821" or random 8 chars
      const adjectives = ['swift', 'pure', 'luna', 'nova', 'zen', 'spark', 'cloud', 'cyber', 'agent', 'fast'];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      prefix = `${adj}_${randomNum}`;
    }

    const address = `${prefix}@${selectedDomain}`.toLowerCase();
    const token = nanoid(24);
    const now = Date.now();
    const expiresAt = now + this.defaultTtlMs;

    const inbox: Inbox = {
      address,
      token,
      createdAt: now,
      expiresAt,
      messageCount: 0
    };

    this.inboxes.set(address, inbox);
    if (!this.emails.has(address)) {
      this.emails.set(address, []);
    }

    return inbox;
  }

  /**
   * Retrieves inbox by address, or automatically registers it if valid domain
   */
  public getOrCreateInbox(address: string): Inbox {
    const normalized = address.toLowerCase().trim();
    const existing = this.inboxes.get(normalized);
    if (existing) {
      if (Date.now() > existing.expiresAt) {
        // Expired, refresh it
        existing.expiresAt = Date.now() + this.defaultTtlMs;
      }
      return existing;
    }

    // Auto-create on demand (e.g. when an incoming SMTP email arrives for an arbitrary address)
    const now = Date.now();
    const inbox: Inbox = {
      address: normalized,
      token: nanoid(24),
      createdAt: now,
      expiresAt: now + this.defaultTtlMs,
      messageCount: 0
    };

    this.inboxes.set(normalized, inbox);
    if (!this.emails.has(normalized)) {
      this.emails.set(normalized, []);
    }

    return inbox;
  }

  public getInbox(address: string): Inbox | null {
    const normalized = address.toLowerCase().trim();
    const inbox = this.inboxes.get(normalized);
    if (!inbox) return null;
    if (Date.now() > inbox.expiresAt) {
      this.deleteInbox(normalized);
      return null;
    }
    return inbox;
  }

  /**
   * Saves incoming email, increments inbox counter, and triggers real-time event listeners
   */
  public saveEmail(toAddress: string, email: StoredEmail): void {
    const normalized = toAddress.toLowerCase().trim();
    const inbox = this.getOrCreateInbox(normalized);

    const emailList = this.emails.get(normalized) || [];
    // Prepend (newest first)
    emailList.unshift(email);
    this.emails.set(normalized, emailList);

    inbox.messageCount = emailList.length;

    // Emit event for SSE and AI Agent listeners
    this.eventEmitter.emit(`email:${normalized}`, email);
    this.eventEmitter.emit('global_email', { address: normalized, email });
  }

  public getEmails(address: string): StoredEmail[] {
    const normalized = address.toLowerCase().trim();
    return this.emails.get(normalized) || [];
  }

  public getEmail(address: string, emailId: string): StoredEmail | null {
    const normalized = address.toLowerCase().trim();
    const list = this.emails.get(normalized) || [];
    const found = list.find(e => e.id === emailId);
    if (found) {
      found.read = true;
      return found;
    }
    return null;
  }

  public deleteInbox(address: string): boolean {
    const normalized = address.toLowerCase().trim();
    this.emails.delete(normalized);
    return this.inboxes.delete(normalized);
  }

  public extendInbox(address: string, additionalMinutes: number = 30): Inbox | null {
    const inbox = this.getInbox(address);
    if (!inbox) return null;
    inbox.expiresAt += additionalMinutes * 60 * 1000;
    return inbox;
  }

  /**
   * Event listener for SSE streams
   */
  public subscribeToInbox(address: string, callback: (email: StoredEmail) => void): () => void {
    const normalized = address.toLowerCase().trim();
    const eventName = `email:${normalized}`;
    this.eventEmitter.on(eventName, callback);
    return () => {
      this.eventEmitter.off(eventName, callback);
    };
  }

  /**
   * AI Agent helper: waits for next incoming email or resolves existing unread email
   */
  public async waitForEmail(address: string, timeoutMs: number = 30000, lastReceivedAt: number = 0): Promise<StoredEmail | null> {
    const normalized = address.toLowerCase().trim();
    
    // Check if a message has already arrived after lastReceivedAt
    const existing = this.getEmails(normalized);
    if (existing.length > 0) {
      const fresh = existing.find(e => e.receivedAt > lastReceivedAt);
      if (fresh) return fresh;
    }

    return new Promise((resolve) => {
      let timer: NodeJS.Timeout;

      const onEmail = (email: StoredEmail) => {
        clearTimeout(timer);
        this.eventEmitter.off(`email:${normalized}`, onEmail);
        resolve(email);
      };

      timer = setTimeout(() => {
        this.eventEmitter.off(`email:${normalized}`, onEmail);
        resolve(null);
      }, timeoutMs);

      this.eventEmitter.once(`email:${normalized}`, onEmail);
    });
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [address, inbox] of this.inboxes.entries()) {
      if (now > inbox.expiresAt) {
        this.inboxes.delete(address);
        this.emails.delete(address);
      }
    }
  }

  private sanitizePrefix(prefix: string): string {
    return prefix
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 32);
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
