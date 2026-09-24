const API_BASE = 'https://gecici.email/api/v1';

let currentAddress = '';
let eventSource = null;

// DOM Elements
const addressDisplay = document.getElementById('addressDisplay');
const btnCopy = document.getElementById('btnCopy');
const btnCopyText = document.getElementById('btnCopyText');
const btnRefresh = document.getElementById('btnRefresh');
const btnCustom = document.getElementById('btnCustom');
const btnWeb = document.getElementById('btnWeb');
const customBox = document.getElementById('customBox');
const customInput = document.getElementById('customInput');
const btnCustomSave = document.getElementById('btnCustomSave');
const btnCustomCancel = document.getElementById('btnCustomCancel');
const messagesList = document.getElementById('messagesList');
const msgCount = document.getElementById('msgCount');
const ttlText = document.getElementById('ttlText');

// Audio feedback
function playBeep(freq = 800) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Clear badge on popup open
  chrome.runtime.sendMessage({ action: 'resetBadge' });

  // Load stored address
  const data = await chrome.storage.local.get(['currentAddress', 'expiresAt']);
  const now = Date.now();

  if (data.currentAddress && data.expiresAt && data.expiresAt > now) {
    currentAddress = data.currentAddress;
    updateAddressUI(currentAddress);
    startTtlCountdown(data.expiresAt);
    await loadMessages(currentAddress);
    connectSse(currentAddress);
  } else {
    await generateNewInbox();
  }
});

// Generate Random Inbox
async function generateNewInbox() {
  addressDisplay.textContent = 'OLUŞTURULUYOR...';
  try {
    const res = await fetch(`${API_BASE}/inbox/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'gecici.email' }),
    });
    const data = await res.json();
    if (data.success && data.inbox) {
      currentAddress = data.inbox.address;
      await chrome.storage.local.set({
        currentAddress: currentAddress,
        expiresAt: data.inbox.expiresAt,
        lastSeenMessageCount: 0,
      });
      updateAddressUI(currentAddress);
      startTtlCountdown(data.inbox.expiresAt);
      renderMessages([]);
      connectSse(currentAddress);
      chrome.runtime.sendMessage({
        action: 'updateActiveAddress',
        address: currentAddress,
        count: 0,
      });
    }
  } catch (err) {
    addressDisplay.textContent = 'HATA: BAĞLANAMADI';
  }
}

// Create Custom Inbox
async function createCustomInbox(prefix) {
  addressDisplay.textContent = 'AYARLANIYOR...';
  try {
    const res = await fetch(`${API_BASE}/inbox/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: prefix, domain: 'gecici.email' }),
    });
    const data = await res.json();
    if (data.success && data.inbox) {
      currentAddress = data.inbox.address;
      await chrome.storage.local.set({
        currentAddress: currentAddress,
        expiresAt: data.inbox.expiresAt,
        lastSeenMessageCount: 0,
      });
      updateAddressUI(currentAddress);
      startTtlCountdown(data.inbox.expiresAt);
      renderMessages([]);
      connectSse(currentAddress);
      customBox.style.display = 'none';
      customInput.value = '';
    } else {
      alert(data.error || 'Bu isim kullanılamıyor.');
      updateAddressUI(currentAddress);
    }
  } catch (err) {
    alert('Sunucu hatası.');
    updateAddressUI(currentAddress);
  }
}

// Load Messages
async function loadMessages(addr) {
  try {
    const res = await fetch(`${API_BASE}/inbox/${encodeURIComponent(addr)}/messages`);
    if (res.ok) {
      const data = await res.json();
      renderMessages(data.messages || []);
    }
  } catch (err) {}
}

// Connect Real-Time SSE
function connectSse(addr) {
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource(`${API_BASE}/inbox/${encodeURIComponent(addr)}/stream`);
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'new_email' && data.email) {
        playBeep(950);
        loadMessages(addr);
      }
    } catch (e) {}
  };
}

// Render Messages UI
function renderMessages(messages) {
  msgCount.textContent = messages.length;

  if (messages.length === 0) {
    messagesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✉</div>
        <div class="empty-title">SİNYAL BEKLENİYOR</div>
        <div class="empty-sub">Gelen postalar burada görünecektir.</div>
      </div>
    `;
    return;
  }

  messagesList.innerHTML = '';
  messages.forEach((msg) => {
    const card = document.createElement('div');
    card.className = 'message-card';

    const senderName = msg.from.name || msg.from.address;
    const timeStr = new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const otp = msg.smartSummary?.otpCode;

    card.innerHTML = `
      <div class="message-top">
        <span class="message-sender">${escapeHtml(senderName)}</span>
        <span class="message-time">${timeStr}</span>
      </div>
      <div class="message-subject">${escapeHtml(msg.subject)}</div>
      ${
        otp
          ? `
        <div class="message-otp-banner">
          <span class="otp-value">${otp}</span>
          <button class="otp-btn" data-otp="${otp}">KOPYALA</button>
        </div>
      `
          : ''
      }
    `;

    messagesList.appendChild(card);
  });

  // Attach OTP copy listeners
  document.querySelectorAll('.otp-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const otpCode = e.target.getAttribute('data-otp');
      navigator.clipboard.writeText(otpCode);
      playBeep(1200);
      e.target.textContent = '✓ ALINDI';
      setTimeout(() => {
        e.target.textContent = 'KOPYALA';
      }, 2000);
    });
  });
}

function updateAddressUI(addr) {
  addressDisplay.textContent = addr;
}

let countdownInterval = null;
function startTtlCountdown(expireMs) {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const remaining = Math.max(0, expireMs - Date.now());
    if (remaining <= 0) {
      ttlText.textContent = 'EXPIRED';
      clearInterval(countdownInterval);
    } else {
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      ttlText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Button Events
btnCopy.addEventListener('click', async () => {
  if (!currentAddress) return;
  await navigator.clipboard.writeText(currentAddress);
  playBeep(1100);
  btnCopy.classList.add('btn-copied');
  btnCopyText.textContent = '✓ ALINDI';
  setTimeout(() => {
    btnCopy.classList.remove('btn-copied');
    btnCopyText.textContent = '⧉ KOPYALA';
  }, 2000);
});

btnRefresh.addEventListener('click', async () => {
  playBeep(700);
  await generateNewInbox();
});

btnCustom.addEventListener('click', () => {
  customBox.style.display = customBox.style.display === 'none' ? 'flex' : 'none';
  if (customBox.style.display === 'flex') {
    customInput.focus();
  }
});

btnCustomCancel.addEventListener('click', () => {
  customBox.style.display = 'none';
  customInput.value = '';
});

btnCustomSave.addEventListener('click', async () => {
  const prefix = customInput.value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (prefix.length < 2) {
    alert('En az 2 karakter giriniz.');
    return;
  }
  playBeep(850);
  await createCustomInbox(prefix);
});

btnWeb.addEventListener('click', () => {
  chrome.tabs.create({ url: `https://gecici.email/?inbox=${encodeURIComponent(currentAddress)}` });
});

const btnSidePanel = document.getElementById('btnSidePanel');
if (btnSidePanel) {
  if (!chrome.sidePanel) {
    btnSidePanel.style.display = 'none';
  } else {
    btnSidePanel.addEventListener('click', async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.windowId) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
          window.close();
        }
      } catch (e) {
        console.error('Side panel open error:', e);
      }
    });
  }
}

