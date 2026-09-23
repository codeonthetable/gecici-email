import { Request, Response } from 'express';
import { StorageService } from '../services/storage';

export function handleInboxSseStream(req: Request, res: Response, storage: StorageService) {
  const address = req.params.address?.toLowerCase().trim();
  if (!address) {
    res.status(400).json({ error: 'E-posta adresi belirtilmedi' });
    return;
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable proxy buffering (Nginx/Cloudflare)
    'Access-Control-Allow-Origin': '*'
  });

  // Ensure inbox exists
  const inbox = storage.getOrCreateInbox(address);

  // Send initial connected payload
  const initialData = JSON.stringify({
    type: 'connected',
    address: inbox.address,
    expiresAt: inbox.expiresAt,
    messageCount: inbox.messageCount,
    timestamp: Date.now()
  });
  res.write(`data: ${initialData}\n\n`);

  // Subscribe to real-time incoming emails
  const unsubscribe = storage.subscribeToInbox(address, (newEmail) => {
    const payload = JSON.stringify({
      type: 'new_email',
      email: newEmail,
      timestamp: Date.now()
    });
    res.write(`data: ${payload}\n\n`);
  });

  // Keep-alive heartbeat every 15 seconds
  const heartbeatTimer = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 15000);

  // Cleanup on connection drop
  req.on('close', () => {
    clearInterval(heartbeatTimer);
    unsubscribe();
    res.end();
  });
}
