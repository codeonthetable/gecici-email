const POLL_ALARM = 'gecici_poll_messages';
const CONTEXT_MENU_ID = 'gecici_autofill_email';

// 1. Setup periodic check & context menu on install/update
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(POLL_ALARM, {
    periodInMinutes: 1, // Chrome allows min 1 min alarms in MV3
  });

  // Remove existing context menu if any and re-create
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: '✉️ gecici.email: Adres Üret & Yapıştır',
      contexts: ['editable'],
    });
  });

  console.log('[gecici.email] Background service worker initialized.');
});

// 2. Context Menu Click Handler (Autofill Active Form Element)
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab?.id) {
    try {
      // Get or generate valid address
      let { currentAddress, expiresAt } = await chrome.storage.local.get(['currentAddress', 'expiresAt']);
      const now = Date.now();

      if (!currentAddress || !expiresAt || expiresAt <= now) {
        const res = await fetch('https://gecici.email/api/v1/inbox/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: 'gecici.email' }),
        });
        const data = await res.json();
        if (data.success && data.inbox) {
          currentAddress = data.inbox.address;
          expiresAt = data.inbox.expiresAt;
          await chrome.storage.local.set({
            currentAddress,
            expiresAt,
            lastSeenMessageCount: 0,
          });
        }
      }

      if (!currentAddress) return;

      // Inject email into the active form field & dispatch DOM input/change events
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [currentAddress],
        func: (email) => {
          const el = document.activeElement;
          if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
            el.focus();
            if ('value' in el) {
              el.value = email;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          // Also copy to clipboard in user context
          try {
            navigator.clipboard.writeText(email);
          } catch (e) {}
        },
      });

      // User feedback (badge flash + notification)
      await chrome.action.setBadgeText({ text: '✓' });
      await chrome.action.setBadgeBackgroundColor({ color: '#00ff66' });
      setTimeout(async () => {
        const { lastSeenMessageCount = 0 } = await chrome.storage.local.get('lastSeenMessageCount');
        await chrome.action.setBadgeText({ text: lastSeenMessageCount > 0 ? String(lastSeenMessageCount) : '' });
      }, 3000);

      chrome.notifications.create(`autofill_${Date.now()}`, {
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: 'gecici.email — Adres Yapıştırıldı!',
        message: `${currentAddress} form kutusuna yazıldı ve panoya kopyalandı.`,
        priority: 2,
      });
    } catch (err) {
      console.error('[gecici.email] Autofill error:', err);
    }
  }
});

// 3. Periodic alarm handler (background polling)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === POLL_ALARM) {
    await checkInboxForNewMessages();
  }
});

// 4. Check inbox messages in background
async function checkInboxForNewMessages() {
  try {
    const { currentAddress, lastSeenMessageCount = 0 } = await chrome.storage.local.get([
      'currentAddress',
      'lastSeenMessageCount',
    ]);

    if (!currentAddress) return;

    const res = await fetch(`https://gecici.email/api/v1/inbox/${encodeURIComponent(currentAddress)}/messages`);
    if (!res.ok) return;

    const data = await res.json();
    const messages = data.messages || [];
    const currentCount = messages.length;

    if (currentCount > lastSeenMessageCount) {
      const newMessages = messages.slice(0, currentCount - lastSeenMessageCount);
      const latestMsg = newMessages[0];

      // Update badge
      await chrome.action.setBadgeText({ text: String(currentCount) });
      await chrome.action.setBadgeBackgroundColor({ color: '#ff4e00' });

      // Trigger notification
      const otp = latestMsg.smartSummary?.otpCode;
      const title = otp ? `🔥 OTP Kodu: ${otp}` : `Yeni E-posta: ${latestMsg.subject}`;
      const sender = latestMsg.from?.name || latestMsg.from?.address || 'Bilinmeyen Gönderici';
      const message = otp
        ? `${sender} tarafından gönderildi. Panoya kopyalamak için tıklayın.`
        : `${sender}: ${latestMsg.subject || currentAddress}`;

      chrome.notifications.create(`msg_${latestMsg.id}_${otp || 'none'}`, {
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: title,
        message: message,
        priority: 2,
      });

      await chrome.storage.local.set({ lastSeenMessageCount: currentCount });
    }
  } catch (err) {
    console.error('[gecici.email SW Error]:', err);
  }
}

// 5. Notification click handler
chrome.notifications.onClicked.addListener(async (notificationId) => {
  const { currentAddress } = await chrome.storage.local.get('currentAddress');
  if (currentAddress) {
    await chrome.tabs.create({ url: `https://gecici.email/?inbox=${encodeURIComponent(currentAddress)}` });
  }
});

// 6. Listen to messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'resetBadge') {
    (async () => {
      await chrome.action.setBadgeText({ text: '' });
      sendResponse({ success: true });
    })();
    return true; // Keep channel open
  }

  if (request.action === 'updateActiveAddress') {
    (async () => {
      await chrome.storage.local.set({
        currentAddress: request.address,
        lastSeenMessageCount: request.count || 0,
      });
      sendResponse({ success: true });
    })();
    return true;
  }
});
