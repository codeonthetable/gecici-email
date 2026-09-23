const POLL_ALARM = 'gecici_poll_messages';

// Setup periodic check when extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(POLL_ALARM, {
    periodInMinutes: 1, // Chrome allows min 1 min alarms in MV3
  });
  console.log('[gecici.email] Background service worker initialized.');
});

// Periodic alarm handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === POLL_ALARM) {
    await checkInboxForNewMessages();
  }
});

// Check inbox messages in background
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
      const title = otp ? `OTP Kodu: ${otp}` : `Yeni E-posta: ${latestMsg.subject}`;
      const message = latestMsg.from?.name
        ? `${latestMsg.from.name} tarafından gönderildi.`
        : currentAddress;

      chrome.notifications.create(`msg_${latestMsg.id}`, {
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

// Listen to messages from popup
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
