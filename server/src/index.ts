import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StorageService } from './services/storage';
import { CustomSmtpServer } from './smtp';
import { createApiRouter } from './api/routes';

dotenv.config();

const HTTP_PORT = parseInt(process.env.PORT || '4000', 10);
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '2525', 10);
const DOMAIN = (process.env.DOMAIN || 'gecici.email').toLowerCase();
const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || `${DOMAIN},localhost,127.0.0.1,*`).split(',').map(d => d.trim().toLowerCase());
const INBOX_TTL_MINUTES = parseInt(process.env.INBOX_TTL_MINUTES || '60', 10);

async function bootstrap() {
  console.log('==================================================');
  console.log('  ⚡ gecici.email - Independent Core Engine');
  console.log('==================================================');

  // 1. Initialize In-Memory & TTL Storage Service
  const storage = new StorageService(DOMAIN, INBOX_TTL_MINUTES);

  // 2. Initialize SMTP Server (Receive-Only Daemon)
  const smtpServer = new CustomSmtpServer(storage, {
    port: SMTP_PORT,
    domain: DOMAIN,
    allowedDomains: ALLOWED_DOMAINS
  });

  try {
    await smtpServer.start();
  } catch (err: any) {
    console.warn(`⚠️ [SMTP] Failed to bind SMTP on port ${SMTP_PORT} (${err.message}). If in non-root environment, check permissions or use port > 1024.`);
  }

  // 3. Initialize HTTP & Real-time SSE Express App
  const app = express();
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (!req.url.includes('/stream') && !req.url.includes('/health')) {
      console.log(`[HTTP] ${req.method} ${req.url}`);
    }
    next();
  });

  // Mount API Router
  app.use('/api/v1', createApiRouter(storage, DOMAIN, ALLOWED_DOMAINS));

  // Root welcome & status
  app.get('/', (req, res) => {
    res.json({
      name: 'gecici.email API & Core Engine',
      version: '1.0.0',
      description: 'Independent Temporary Email Service for Humans and AI Agents',
      endpoints: {
        health: '/api/v1/health',
        generateInbox: 'POST /api/v1/inbox/generate',
        customInbox: 'POST /api/v1/inbox/custom',
        listMessages: 'GET /api/v1/inbox/:address/messages',
        sseStream: 'GET /api/v1/inbox/:address/stream',
        aiWait: 'GET /api/v1/inbox/:address/wait',
        aiOtp: 'GET /api/v1/inbox/:address/otp',
        aiLinks: 'GET /api/v1/inbox/:address/links',
        simulate: 'POST /api/v1/simulate'
      }
    });
  });

  const httpServer = app.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`🌐 [HTTP API] Listening on http://0.0.0.0:${HTTP_PORT}`);
    console.log(`📡 [SSE Stream] Available at /api/v1/inbox/:address/stream`);
    console.log(`🤖 [AI Agent Hub] OTP and Magic Link Extractors ready!`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    storage.destroy();
    await smtpServer.stop();
    httpServer.close(() => {
      console.log('HTTP Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
