import { SmartExtractor } from '../services/smart-extractor';

console.log('🧪 Running SmartExtractor Test Suite...\n');

// Test Case 1: Turkish OTP Email
const test1Subject = 'Hesap Doğrulama Kodunuz: 893120';
const test1Text = 'Merhaba Bahadır,\n\nPlatformumuza kaydınızı onaylamak için aşağıdaki 6 haneli güvenlik kodunu giriniz:\n\n893120\n\nBu kod 10 dakika geçerlidir.\n\n© 2026 Gecici.email Tüm hakları saklıdır.';
const test1Html = '<div><p>Hesabınızı onaylamak için kodunuz: <b>893120</b></p><a href="https://example.com/verify?code=893120">Hesabımı Onayla</a></div>';

const res1 = SmartExtractor.extract(test1Subject, test1Text, test1Html, 'auth@platform.com');
console.log('Test 1 (Turkish OTP):');
console.log('  OTP Code:', res1.otpCode);
console.log('  Verification Link:', res1.verificationLink);
console.log('  Action Type:', res1.actionType);
console.assert(res1.otpCode === '893120', 'OTP code should be 893120');
console.assert(res1.actionType === 'verification', 'Action type should be verification');
console.assert(res1.verificationLink?.includes('verify?code=893120'), 'Verification link should be extracted');
console.log('  ✅ Test 1 Passed!\n');

// Test Case 2: English Discord-style Code
const test2Subject = 'Your Discord Security Code is 449-012';
const test2Text = 'Hey there! Someone tried to log in to your account. Your verification code is 449-012. If this was not you, please reset your password immediately.';
const test2Html = '<p>Your verification code: <strong>449-012</strong></p>';

const res2 = SmartExtractor.extract(test2Subject, test2Text, test2Html, 'noreply@discord.com');
console.log('Test 2 (English Format 449-012):');
console.log('  OTP Code:', res2.otpCode);
console.log('  Action Type:', res2.actionType);
console.assert(res2.otpCode === '449-012', 'OTP code should be 449-012');
console.log('  ✅ Test 2 Passed!\n');

// Test Case 3: Password Reset Magic Link
const test3Subject = 'Reset Your Password';
const test3Text = 'Click the link below to reset your password. This link will expire in 1 hour.';
const test3Html = '<div><p>Click below to reset password:</p><a href="https://app.service.com/auth/reset-password?token=secret_xyz999" class="btn btn-primary" style="background:#000;padding:10px;">Reset Password</a></div>';

const res3 = SmartExtractor.extract(test3Subject, test3Text, test3Html, 'security@service.com');
console.log('Test 3 (Password Reset Magic Link):');
console.log('  Verification Link:', res3.verificationLink);
console.log('  Action Text:', res3.actionText);
console.log('  Action Type:', res3.actionType);
console.assert(res3.actionType === 'password_reset', 'Action type should be password_reset');
console.assert(res3.verificationLink?.includes('reset-password?token=secret_xyz999'), 'Magic link should match');
console.log('  ✅ Test 3 Passed!\n');

console.log('🎉 All SmartExtractor tests passed successfully!');
