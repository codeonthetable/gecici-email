import { Router, Request, Response } from 'express';
import { StorageService } from '../services/storage';
import { handleInboxSseStream } from './sse';
import { SmartExtractor } from '../services/smart-extractor';
import { nanoid } from 'nanoid';
import { StoredEmail } from '../types';

export function createApiRouter(storage: StorageService, defaultDomain: string = 'gecici.email', allowedDomains: string[] = ['gecici.email']): Router {
  const router = Router();

  // Health check
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      domain: defaultDomain,
      allowedDomains
    });
  });

  // Generate a new random disposable inbox
  router.post('/inbox/generate', (req: Request, res: Response) => {
    const domain = (req.body?.domain as string) || defaultDomain;
    const inbox = storage.createInbox(undefined, domain);
    res.status(201).json({
      success: true,
      inbox: {
        address: inbox.address,
        token: inbox.token,
        createdAt: inbox.createdAt,
        expiresAt: inbox.expiresAt,
        ttlSeconds: Math.floor((inbox.expiresAt - inbox.createdAt) / 1000)
      }
    });
  });

  // Create or claim a custom prefix inbox
  router.post('/inbox/custom', (req: Request, res: Response) => {
    const prefix = (req.body?.prefix as string || '').trim();
    const domain = (req.body?.domain as string) || defaultDomain;

    if (!prefix || prefix.length < 2) {
      res.status(400).json({ success: false, error: 'Özel isim en az 2 karakter olmalıdır' });
      return;
    }

    const inbox = storage.createInbox(prefix, domain);
    res.status(201).json({
      success: true,
      inbox: {
        address: inbox.address,
        token: inbox.token,
        createdAt: inbox.createdAt,
        expiresAt: inbox.expiresAt,
        ttlSeconds: Math.floor((inbox.expiresAt - inbox.createdAt) / 1000)
      }
    });
  });

  // Get inbox metadata
  router.get('/inbox/:address', (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const inbox = storage.getInbox(address);
    if (!inbox) {
      res.status(404).json({ success: false, error: 'Gelen kutusu bulunamadı veya süresi doldu' });
      return;
    }

    res.json({
      success: true,
      inbox: {
        address: inbox.address,
        createdAt: inbox.createdAt,
        expiresAt: inbox.expiresAt,
        messageCount: inbox.messageCount,
        ttlRemainingSeconds: Math.max(0, Math.floor((inbox.expiresAt - Date.now()) / 1000))
      }
    });
  });

  // List all messages in an inbox
  router.get('/inbox/:address/messages', (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const emails = storage.getEmails(address);

    res.json({
      success: true,
      address,
      count: emails.length,
      messages: emails.map(e => ({
        id: e.id,
        messageId: e.messageId,
        from: e.from,
        subject: e.subject,
        date: e.date,
        smartSummary: e.smartSummary,
        attachmentCount: e.attachments.length,
        read: e.read,
        receivedAt: e.receivedAt
      }))
    });
  });

  // Get single full email details (including HTML and body)
  router.get('/inbox/:address/messages/:id', (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const emailId = req.params.id;
    const email = storage.getEmail(address, emailId);

    if (!email) {
      res.status(404).json({ success: false, error: 'E-posta bulunamadı' });
      return;
    }

    res.json({
      success: true,
      message: email
    });
  });

  // Delete inbox and all associated messages
  router.delete('/inbox/:address', (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const deleted = storage.deleteInbox(address);
    res.json({
      success: deleted,
      message: deleted ? 'Gelen kutusu ve tüm e-postalar silindi' : 'Gelen kutusu bulunamadı'
    });
  });

  // Extend inbox duration
  router.post('/inbox/:address/extend', (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const minutes = Number(req.body?.minutes) || 30;
    const inbox = storage.extendInbox(address, minutes);

    if (!inbox) {
      res.status(404).json({ success: false, error: 'Gelen kutusu bulunamadı' });
      return;
    }

    res.json({
      success: true,
      inbox: {
        address: inbox.address,
        expiresAt: inbox.expiresAt,
        ttlRemainingSeconds: Math.floor((inbox.expiresAt - Date.now()) / 1000)
      }
    });
  });

  // Real-time SSE Stream
  router.get('/inbox/:address/stream', (req: Request, res: Response) => {
    handleInboxSseStream(req, res, storage);
  });

  // ==========================================
  // AI AGENT DEDICATED ENDPOINTS
  // ==========================================

  // AI Agent: Wait for next message (Long polling)
  router.get('/inbox/:address/wait', async (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const timeout = Math.min(Number(req.query.timeout) || 30000, 60000); // max 60s
    const since = Number(req.query.since) || 0;

    const email = await storage.waitForEmail(address, timeout, since);
    if (!email) {
      res.status(408).json({
        success: false,
        timeout: true,
        error: 'Belirtilen süre içinde yeni e-posta gelmedi'
      });
      return;
    }

    res.json({
      success: true,
      message: email
    });
  });

  // AI Agent: Direct OTP Code extractor endpoint
  router.get('/inbox/:address/otp', async (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const timeout = Math.min(Number(req.query.timeout) || 30000, 60000);

    const email = await storage.waitForEmail(address, timeout);
    if (!email) {
      res.status(408).json({
        success: false,
        timeout: true,
        error: 'E-posta veya OTP kodu beklenirken zaman aşımına uğradı'
      });
      return;
    }

    res.json({
      success: true,
      otp: email.smartSummary.otpCode,
      otpContext: email.smartSummary.otpContext,
      actionType: email.smartSummary.actionType,
      sender: email.from,
      subject: email.subject,
      receivedAt: email.receivedAt
    });
  });

  // AI Agent: Direct Magic Link / Verification Link endpoint
  router.get('/inbox/:address/links', async (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const timeout = Math.min(Number(req.query.timeout) || 30000, 60000);

    const email = await storage.waitForEmail(address, timeout);
    if (!email) {
      res.status(408).json({
        success: false,
        timeout: true,
        error: 'E-posta veya aktivasyon linki beklenirken zaman aşımına uğradı'
      });
      return;
    }

    res.json({
      success: true,
      verificationLink: email.smartSummary.verificationLink,
      actionText: email.smartSummary.actionText,
      actionType: email.smartSummary.actionType,
      sender: email.from,
      subject: email.subject,
      receivedAt: email.receivedAt
    });
  });

  // AI Agent: Clean compact text representation for LLM prompt injection
  router.get('/inbox/:address/ai-summary', async (req: Request, res: Response) => {
    const address = req.params.address.toLowerCase().trim();
    const emails = storage.getEmails(address);

    if (emails.length === 0) {
      res.json({
        success: true,
        address,
        hasMessages: false,
        summary: 'Gelen kutusu boş.'
      });
      return;
    }

    const latest = emails[0];
    res.json({
      success: true,
      address,
      hasMessages: true,
      totalCount: emails.length,
      latestSummary: latest.smartSummary.cleanSummary,
      otpCode: latest.smartSummary.otpCode,
      verificationLink: latest.smartSummary.verificationLink,
      actionType: latest.smartSummary.actionType,
      receivedAt: latest.receivedAt
    });
  });

  // Simulation endpoint for test and development
  router.post('/simulate', (req: Request, res: Response) => {
    const toAddress = (req.body?.to as string || '').toLowerCase().trim();
    const fromAddress = (req.body?.from as string) || 'noreply@github.com';
    const fromName = (req.body?.fromName as string) || 'GitHub Verification';
    const subject = (req.body?.subject as string) || 'Your GitHub verification code: 893120';
    const text = (req.body?.text as string) || 'Please use verification code 893120 to confirm your account on GitHub.';
    const html = (req.body?.html as string) || `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Doğrulama Kodunuz</h2>
        <p>Hesabınızı onaylamak için aşağıdaki 6 haneli kodu kullanın:</p>
        <div style="font-size: 28px; font-weight: bold; background: #f0f4f8; padding: 15px; text-align: center; border-radius: 8px;">
          893120
        </div>
        <p>Veya doğrudan aşağıdaki butona tıklayabilirsiniz:</p>
        <a href="https://example.com/verify?token=xyz_893120" style="display:inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Hesabımı Doğrula</a>
      </div>
    `;

    if (!toAddress) {
      res.status(400).json({ success: false, error: 'Alıcı e-posta adresi (to) belirtilmelidir' });
      return;
    }

    const smartSummary = SmartExtractor.extract(subject, text, html, fromAddress);

    const storedEmail: StoredEmail = {
      id: nanoid(16),
      messageId: `<sim-${nanoid(12)}@gecici.email>`,
      from: {
        name: fromName,
        address: fromAddress
      },
      to: [toAddress],
      subject,
      date: new Date().toISOString(),
      text,
      html,
      smartSummary,
      attachments: [],
      read: false,
      receivedAt: Date.now()
    };

    storage.saveEmail(toAddress, storedEmail);

    res.status(201).json({
      success: true,
      message: 'Simüle edilmiş e-posta başarıyla gelen kutusuna eklendi',
      email: storedEmail
    });
  });

  return router;
}
