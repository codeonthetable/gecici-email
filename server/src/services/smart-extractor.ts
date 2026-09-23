import * as cheerio from 'cheerio';
import { ActionType, SmartSummary } from '../types';

export class SmartExtractor {
  // Multilingual OTP Keywords
  private static OTP_KEYWORDS = [
    // Turkish
    'onay kodunuz', 'onay kodu', 'doğrulama kodunuz', 'doğrulama kodu', 'güvenlik kodunuz', 'güvenlik kodu',
    'tek kullanımlık şifre', 'tek kullanımlık kod', 'erişim kodu', 'giriş kodu', 'kod:', 'kodu:',
    // English
    'verification code is', 'verification code:', 'verification code', 'verify code', 'security code is',
    'security code:', 'security code', 'confirmation code is', 'confirmation code:', 'confirmation code',
    'one-time password', 'one-time code', 'passcode', 'otp', 'pin code', 'auth code', 
    'authorization code', 'login code', 'access code', 'your code is', 'your code:', 'code is'
  ];

  // Action link button text patterns
  private static ACTION_BUTTON_KEYWORDS = [
    // Turkish
    'doğrula', 'onayla', 'hesabımı doğrula', 'e-postayı onayla', 'hesabı etkinleştir',
    'giriş yap', 'şifremi sıfırla', 'şifre sıfırla', 'şifreyi yenile', 'hesaba git',
    // English
    'verify email', 'verify your email', 'verify account', 'confirm email', 'confirm account',
    'activate account', 'get started', 'sign in', 'log in', 'reset password', 'claim your code',
    'complete registration', 'click here to verify', 'confirm your registration'
  ];

  // Links to explicitly ignore when looking for action buttons
  private static IGNORED_LINK_PATTERNS = [
    'unsubscribe', 'abonelikten', 'privacy', 'gizlilik', 'terms', 'şartlar', 
    'twitter.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'youtube.com',
    'mailto:', 'tel:', 'javascript:', 'help', 'destek', 'preferences', 'ayarlar'
  ];

  /**
   * Main analysis function: parses text and HTML into a structured SmartSummary
   */
  public static extract(subject: string, textBody: string, htmlBody: string, senderAddress: string): SmartSummary {
    const cleanText = (textBody || '').trim();
    const senderDomain = this.extractDomain(senderAddress);
    
    // 1. Extract OTP Code
    const { otpCode, otpContext } = this.extractOtp(subject, cleanText, htmlBody);

    // 2. Extract Action/Verification Link
    const { verificationLink, actionText } = this.extractActionLink(htmlBody, cleanText);

    // 3. Determine Action Type
    const actionType = this.classifyAction(subject, cleanText, otpCode, verificationLink);

    // 4. Generate ultra-clean AI-ready summary
    const aiSummary = this.generateCleanSummary(subject, cleanText, otpCode, verificationLink, actionType);

    // 5. Detect if automated
    const isAutomated = this.checkIfAutomated(senderAddress, subject, cleanText);

    return {
      otpCode,
      otpContext,
      verificationLink,
      actionText,
      actionType,
      cleanSummary: aiSummary,
      senderDomain,
      isAutomated
    };
  }

  /**
   * Extracts OTP codes with proximity scoring and context validation
   */
  private static extractOtp(subject: string, text: string, html: string): { otpCode: string | null; otpContext: string | null } {
    const combinedContent = `${subject}\n${text}`;
    
    // Pattern 1: Explicit keyword followed closely by digits/code (e.g., "Verification code: 893104", "Onay kodu 492-192")
    for (const keyword of this.OTP_KEYWORDS) {
      // Look for keyword followed by optional colon/is/spaces and then a 4-8 digit numeric or hyphenated code
      const regex = new RegExp(`\\b${keyword}\\b(?:\\s*(?:is|are|:|\\-|=|->)\\s*)?([0-9]{3,4}-[0-9]{3,4}|[A-Z]{1,2}-[0-9]{4,6}|[0-9]{4,8})\\b`, 'i');
      const match = combinedContent.match(regex);
      if (match && match[1]) {
        const cleanedCode = match[1].trim();
        // Discard pure years (e.g. 2024, 2025, 2026) unless keyword is explicit
        if (!/^(19|20)\d{2}$/.test(cleanedCode) || keyword.includes('kod') || keyword.includes('code') || keyword.includes('otp')) {
          return {
            otpCode: cleanedCode,
            otpContext: match[0].trim()
          };
        }
      }
    }

    // Pattern 2: Look in Subject line for standalone 4-8 digit or hyphenated codes
    const subjectMatch = subject.match(/\b([0-9]{3,4}-[0-9]{3,4}|[0-9]{4,8}|[A-Z]{1,2}-[0-9]{4,6})\b/);
    if (subjectMatch && subjectMatch[1]) {
      const code = subjectMatch[1];
      if (!/^(19|20)\d{2}$/.test(code)) {
        return { otpCode: code, otpContext: `Subject: ${subject}` };
      }
    }

    // Pattern 3: Look in HTML for highlighted big fonts / spans with standalone digits
    if (html) {
      try {
        const $ = cheerio.load(html);
        let foundCode: string | null = null;
        let contextText: string | null = null;

        $('h1, h2, h3, b, strong, span, p').each((_, el) => {
          if (foundCode) return;
          const elText = $(el).text().trim();
          if (/^([0-9]{4,8}|[0-9]{3,4}-[0-9]{3,4}|[A-Z]{1,2}-[0-9]{4,6})$/.test(elText)) {
            const parentText = $(el).parent().text().toLowerCase();
            const hasKeyword = this.OTP_KEYWORDS.some(k => parentText.includes(k.toLowerCase()));
            if (hasKeyword && !/^(19|20)\d{2}$/.test(elText)) {
              foundCode = elText;
              contextText = parentText.slice(0, 100);
            }
          }
        });

        if (foundCode) {
          return { otpCode: foundCode, otpContext: contextText };
        }
      } catch (err) {
        // Parse safety
      }
    }

    // Pattern 4: Fallback standalone 6-digit number in text if surrounded by OTP hints
    const sixDigitMatch = text.match(/\b([0-9]{6})\b/);
    if (sixDigitMatch && sixDigitMatch[1]) {
      const code = sixDigitMatch[1];
      if (!/^(19|20)\d{2}/.test(code)) {
        return { otpCode: code, otpContext: 'Standard 6-digit match' };
      }
    }

    return { otpCode: null, otpContext: null };
  }

  /**
   * Extracts actionable URLs (Magic Links, verification buttons, password reset links)
   */
  private static extractActionLink(html: string, text: string): { verificationLink: string | null; actionText: string | null } {
    if (html) {
      try {
        const $ = cheerio.load(html);
        let bestLink: string | null = null;
        let bestText: string | null = null;
        let highestScore = 0;

        $('a').each((_, el) => {
          const href = $(el).attr('href')?.trim();
          const linkText = $(el).text().trim().toLowerCase();
          
          if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
          }

          // Check if ignored
          const isIgnored = this.IGNORED_LINK_PATTERNS.some(p => href.toLowerCase().includes(p) || linkText.includes(p));
          if (isIgnored) return;

          let score = 0;

          // Score based on button text keywords
          for (const kw of this.ACTION_BUTTON_KEYWORDS) {
            if (linkText.includes(kw)) {
              score += 10;
              break;
            }
          }

          // Score based on URL keywords
          const urlLower = href.toLowerCase();
          if (urlLower.includes('verify') || urlLower.includes('confirm') || urlLower.includes('dogrula') || urlLower.includes('onay')) score += 8;
          if (urlLower.includes('token=') || urlLower.includes('code=') || urlLower.includes('key=')) score += 5;
          if (urlLower.includes('auth') || urlLower.includes('login') || urlLower.includes('magic')) score += 4;
          if (urlLower.includes('reset') || urlLower.includes('password') || urlLower.includes('sifre')) score += 8;

          // Check if link looks like a button element
          const style = $(el).attr('style') || '';
          const className = $(el).attr('class') || '';
          if (style.includes('background') || style.includes('padding') || className.includes('btn') || className.includes('button')) {
            score += 3;
          }

          if (score > highestScore && score >= 5) {
            highestScore = score;
            bestLink = href;
            bestText = $(el).text().trim() || 'Doğrula / Onayla';
          }
        });

        if (bestLink) {
          return { verificationLink: bestLink, actionText: bestText };
        }
      } catch (err) {
        // Parse safety
      }
    }

    // Fallback: extract first URL in plain text containing verify/confirm tokens
    const urlMatches = text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/gi);
    if (urlMatches) {
      for (const url of urlMatches) {
        const lower = url.toLowerCase();
        if (
          (lower.includes('verify') || lower.includes('confirm') || lower.includes('token') || lower.includes('activate') || lower.includes('onay') || lower.includes('reset')) &&
          !this.IGNORED_LINK_PATTERNS.some(p => lower.includes(p))
        ) {
          return { verificationLink: url, actionText: 'Verification Link' };
        }
      }
    }

    return { verificationLink: null, actionText: null };
  }

  /**
   * Categorizes email into standardized action types
   */
  private static classifyAction(subject: string, text: string, otp: string | null, link: string | null): ActionType {
    const content = `${subject} ${text}`.toLowerCase();
    
    if (
      content.includes('şifre') || 
      content.includes('password') || 
      content.includes('passwort') ||
      (link && link.toLowerCase().includes('reset'))
    ) {
      if (content.includes('sıfırla') || content.includes('reset') || content.includes('yenile')) {
        return 'password_reset';
      }
    }
    
    if (otp || content.includes('doğrulama') || content.includes('onay') || content.includes('verification') || content.includes('confirm') || content.includes('activate')) {
      return 'verification';
    }
    if (content.includes('giriş yap') || content.includes('sign in') || content.includes('log in') || content.includes('magic link')) {
      return 'login';
    }
    if (content.includes('güvenlik uyarısı') || content.includes('security alert') || content.includes('new login')) {
      return 'security_alert';
    }
    if (content.includes('bülten') || content.includes('newsletter') || content.includes('digest')) {
      return 'newsletter';
    }
    return 'generic';
  }

  /**
   * Generates a high-signal, concise text summary for AI LLM context windows
   */
  private static generateCleanSummary(
    subject: string, 
    text: string, 
    otp: string | null, 
    link: string | null, 
    action: ActionType
  ): string {
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !this.isBoilerplateLine(l));
    
    const summaryExcerpt = lines.slice(0, 3).join(' ');

    let aiOutput = `[E-posta Konusu]: ${subject}\n`;
    if (otp) {
      aiOutput += `[YAKALANAN OTP / DOĞRULAMA KODU]: ${otp}\n`;
    }
    if (link) {
      aiOutput += `[ONAY / İŞLEM BAĞLANTISI]: ${link}\n`;
    }
    aiOutput += `[İŞLEM TÜRÜ]: ${action}\n`;
    if (summaryExcerpt) {
      aiOutput += `[ÖZET METİN]: ${summaryExcerpt.slice(0, 250)}`;
    }

    return aiOutput.trim();
  }

  private static isBoilerplateLine(line: string): boolean {
    const l = line.toLowerCase();
    return (
      l.includes('copyright') ||
      l.includes('tüm hakları saklıdır') ||
      l.includes('all rights reserved') ||
      l.includes('unsubscribe') ||
      l.includes('abonelikten çık') ||
      l.includes('gizlilik politikası') ||
      l.includes('privacy policy') ||
      l.length < 3
    );
  }

  private static extractDomain(address: string): string {
    const match = address.match(/@([^>]+)/);
    return match ? match[1].toLowerCase().trim() : '';
  }

  private static checkIfAutomated(from: string, subject: string, text: string): boolean {
    const f = from.toLowerCase();
    return (
      f.includes('noreply') ||
      f.includes('no-reply') ||
      f.includes('donotreply') ||
      f.includes('notification') ||
      f.includes('bildirim') ||
      f.includes('mailer') ||
      f.includes('bot')
    );
  }
}
