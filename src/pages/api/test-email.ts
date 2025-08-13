import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { renderWelcomeEmail } from '@/lib/email-renderer';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({ error: 'Test email address required' });
    }

    // Generate dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

    // Render test email template
    const emailHtml = renderWelcomeEmail({
      userName: 'Test User',
      dashboardUrl
    });

    const emailResult = await resend.emails.send({
      from: 'YourNextLease <onboarding@resend.dev>', // Use Resend's default domain for testing
      to: [testEmail],
      subject: '🧪 YourNextLease Email Test - Welcome!',
      html: emailHtml,
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully!',
      data: emailResult 
    });
  } catch (error) {
    console.error('Test email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 