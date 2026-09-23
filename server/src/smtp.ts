import { SMTPServer, SMTPServerAddress, SMTPServerSession } from 'smtp-server';
import { simpleParser, ParsedMail } from 'mailparser';
import { nanoid } from 'nanoid';
import { StorageService } from './services/storage';
import { SmartExtractor } from './services/smart-extractor';
import { StoredEmail, EmailAttachment } from './types';

export interface SmtpServerOptions {
  port: number;
  domain: string;
  allowedDomains: string[];
  maxMessageSizeBytes?: number;
}

export class CustomSmtpServer {
  private server: SMTPServer;
  private storage: StorageService;
  private options: SmtpServerOptions;

  constructor(storage: StorageService, options: SmtpServerOptions) {
    this.storage = storage;
    this.options = {
      maxMessageSizeBytes: 10 * 1024 * 1024, // 10MB max
      ...options
    };

    this.server = new SMTPServer({
      name: options.domain,
      banner: `Welcome to ${options.domain} Disposable Mail Gateway`,
      size: this.options.maxMessageSizeBytes,
      disabledCommands: ['AUTH'], // Receive-only server, no auth required for inbound relay
      authOptional: true,

      onConnect: (session: SMTPServerSession, callback: (err?: Error | null) => void) => {
        // Accept inbound connections
        return callback();
      },

      onMailFrom: (address: SMTPServerAddress, session: SMTPServerSession, callback: (err?: Error | null) => void) => {
        // Accept any sender
        return callback();
      },

      onRcptTo: (address: SMTPServerAddress, session: SMTPServerSession, callback: (err?: Error | null) => void) => {
        const rcpt = address.address.toLowerCase();
        const domain = rcpt.split('@')[1];

        // Check if recipient domain is allowed (or wildcard match)
        const isAllowed = this.options.allowedDomains.some(d => d.toLowerCase() === domain || d === '*');
        if (!isAllowed) {
          return callback(new Error(`Relay denied for domain: ${domain}`));
        }

        return callback();
      },

      onData: (stream, session: SMTPServerSession, callback: (err?: Error | null) => void) => {
        simpleParser(stream, async (err: Error | null, parsed: ParsedMail) => {
          if (err) {
            console.error('[SMTP] Error parsing email stream:', err);
            return callback(err);
          }

          try {
            await this.processParsedEmail(parsed, session);
            return callback();
          } catch (processErr: any) {
            console.error('[SMTP] Error saving email:', processErr);
            return callback(processErr);
          }
        });
      }
    });

    this.server.on('error', (err) => {
      console.error('[SMTP Server Error]:', err.message);
    });
  }

  private async processParsedEmail(parsed: ParsedMail, session: SMTPServerSession): Promise<void> {
    const mailFromObj = typeof session.envelope.mailFrom === 'object' && session.envelope.mailFrom ? session.envelope.mailFrom : null;
    const fromAddress = parsed.from?.value[0]?.address || mailFromObj?.address || 'unknown@sender.com';
    const fromName = parsed.from?.value[0]?.name || fromAddress.split('@')[0];
    const subject = parsed.subject || '(Başlıksız E-posta)';
    const textBody = parsed.text || '';
    const htmlBody = (typeof parsed.html === 'string' ? parsed.html : parsed.textAsHtml) || '';

    // Convert attachments
    const attachments: EmailAttachment[] = (parsed.attachments || []).map(att => ({
      filename: att.filename || 'attachment',
      contentType: att.contentType,
      size: att.size,
      contentBase64: att.content ? att.content.toString('base64') : undefined
    }));

    // AI / Heuristic Extraction
    const smartSummary = SmartExtractor.extract(subject, textBody, htmlBody, fromAddress);

    // Envelope recipients
    const recipients = session.envelope.rcptTo.map(r => r.address.toLowerCase());

    const storedEmail: StoredEmail = {
      id: nanoid(16),
      messageId: parsed.messageId || nanoid(20),
      from: {
        name: fromName,
        address: fromAddress
      },
      to: recipients,
      subject,
      date: (parsed.date || new Date()).toISOString(),
      text: textBody,
      html: htmlBody,
      smartSummary,
      attachments,
      read: false,
      receivedAt: Date.now()
    };

    // Save for every recipient inbox
    for (const recipient of recipients) {
      this.storage.saveEmail(recipient, storedEmail);
      console.log(`[SMTP] Saved email for ${recipient} - Subject: "${subject}" - OTP: ${smartSummary.otpCode || 'None'}`);
    }

    // Forward to Webhook if configured (e.g. live web platform on https://gecici.email)
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      for (const recipient of recipients) {
        try {
          fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'gecici-smtp-relay/1.0'
            },
            body: JSON.stringify({
              to: recipient,
              from: fromAddress,
              fromName: fromName,
              subject: subject,
              text: textBody,
              html: htmlBody
            })
          })
          .then(async res => {
            if (!res.ok) {
              const txt = await res.text();
              console.warn(`[SMTP Webhook] HTTP ${res.status} from ${webhookUrl}: ${txt.slice(0, 100)}`);
            } else {
              console.log(`[SMTP Webhook] Successfully relayed email for ${recipient} to ${webhookUrl}`);
            }
          })
          .catch(err => {
            console.error(`[SMTP Webhook Error] Failed to relay to ${webhookUrl}:`, err.message);
          });
        } catch (err: any) {
          console.error(`[SMTP Webhook Exception]:`, err.message);
        }
      }
    }
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.options.port, '0.0.0.0', () => {
        console.log(`🚀 [SMTP Server] Listening on port ${this.options.port} for domain: ${this.options.domain}`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('[SMTP Server] Stopped.');
        resolve();
      });
    });
  }
}
