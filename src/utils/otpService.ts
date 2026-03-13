import { info } from './logger';

export class OtpService {

  static generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static getExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes
    return expiresAt;
  }

  private static logoSvg = `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="56" fill="url(#grad)" stroke="#0EA5E9" stroke-width="4" />
  <path d="M36 60 l18 -18 l18 18 l-18 18 Z" fill="white" />
  <path d="M36 60 h48" stroke="white" stroke-width="4" stroke-linecap="round" />
</svg>`;

  static async sendOtp(email: string, otp: string) {
    const subject = 'Verify your ClearSplit account';
    const plainText = `Hello,

Your ClearSplit verification code is: ${otp}

This code will expire in 10 minutes.

If you did not request this, you can safely ignore this email.

— The ClearSplit Team`;

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937;">
        <div style="max-width: 520px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 72px; height: 72px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              ${this.logoSvg}
            </div>
            <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.02em;">Verify your email</h1>
            <p style="margin: 8px 0 0; color: #4b5563;">Use the code below to complete your ClearSplit sign up.</p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">Your verification code</p>
            <p style="margin: 0; font-size: 32px; letter-spacing: 4px; font-weight: 700; color: #0f172a;">${otp}</p>
          </div>

          <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
            This code will expire in <strong>10 minutes</strong>. If you didn’t request this, you can ignore this email.
          </p>

          <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">Need help? Email us at <a href="mailto:donotreply@clearsplit.io" style="color: #3b82f6; text-decoration: none;">donotreply@clearsplit.io</a></p>
          </div>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject,
        text: plainText,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      info(`[OTP] Failed to send OTP to ${email}: ${response.status} ${errorData}`);
      throw new Error('Failed to send OTP');
    }

    const result = await response.json();
    info(`[OTP] OTP sent successfully to ${email}, ID: ${result.id}`);
  }
}

