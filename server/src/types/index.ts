export type ActionType = 
  | 'verification' 
  | 'login' 
  | 'password_reset' 
  | 'security_alert' 
  | 'newsletter' 
  | 'notification' 
  | 'generic';

export interface SmartSummary {
  otpCode: string | null;
  otpContext: string | null;
  verificationLink: string | null;
  actionText: string | null;
  actionType: ActionType;
  cleanSummary: string;
  senderDomain: string;
  isAutomated: boolean;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  contentBase64?: string;
}

export interface StoredEmail {
  id: string;
  messageId: string;
  from: {
    name: string;
    address: string;
  };
  to: string[];
  subject: string;
  date: string;
  text: string;
  html: string;
  smartSummary: SmartSummary;
  attachments: EmailAttachment[];
  read: boolean;
  receivedAt: number;
}

export interface Inbox {
  address: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  messageCount: number;
}

export interface ServerConfig {
  port: number;
  smtpPort: number;
  domain: string;
  allowedDomains: string[];
  inboxTtlMinutes: number;
  maxMessagesPerInbox: number;
  redisUrl?: string;
}
