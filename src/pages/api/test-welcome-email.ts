import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { renderWelcomeEmail } from '@/lib/email-renderer';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, userName } = req.body;

    if (!userEmail || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Testing welcome email to:', userEmail, 'for user:', userName);

    // Generate dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

    // Render email template
    const emailHtml = renderWelcomeEmail({
      userName,
      dashboardUrl
    });

    const emailResult = await resend.emails.send({
      from: 'YourNextLease <notification@yournextlease.com>',
      to: [userEmail],
      subject: 'Test: Welcome to YourNextLease! 🏠',
      html: emailHtml,
    });

    console.log('Test welcome email sent successfully:', emailResult);
    return res.status(200).json({ success: true, data: emailResult });
  } catch (error) {
    console.error('Test welcome email sending error:', error);
    return res.status(500).json({ error: 'Failed to send test welcome email' });
  }
} 