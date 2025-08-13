import type { NextApiRequest, NextApiResponse } from 'next';
import { renderWelcomeEmail } from '@/lib/email-renderer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({ error: 'Missing userName' });
    }

    // Generate dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

    // Render email template
    const emailHtml = renderWelcomeEmail({
      userName,
      dashboardUrl
    });

    // Return the HTML for inspection
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(emailHtml);
  } catch (error) {
    console.error('Email template rendering error:', error);
    return res.status(500).json({ error: 'Failed to render email template' });
  }
} 