import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { renderMessageNotificationEmail } from '@/lib/email-renderer';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test data - simulating real user data
    const testData = {
      recipientEmail: req.body.recipientEmail || 'test@example.com',
      recipientName: req.body.recipientName || 'John Smith',
      senderName: req.body.senderName || 'Sarah Johnson',
      listingTitle: req.body.listingTitle || 'Cozy 2BR Apartment near Campus',
      messagePreview: req.body.messagePreview || 'Hi! I\'m interested in your apartment. Is it still available? I\'m looking for a place starting next month and would love to schedule a viewing if possible.'
    };

    // Generate dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?tab=messages`;

    console.log('Sending test message notification email with data:', testData);

    // Render email template
    const emailHtml = renderMessageNotificationEmail({
      recipientName: testData.recipientName,
      senderName: testData.senderName,
      listingTitle: testData.listingTitle,
      messagePreview: testData.messagePreview,
      dashboardUrl
    });

    const emailResult = await resend.emails.send({
      from: 'YourNextLease <notification@yournextlease.com>',
      to: [testData.recipientEmail],
      subject: `New message from ${testData.senderName} on YourNextLease`,
      html: emailHtml,
    });

    console.log('Test message notification email sent successfully:', emailResult);

    return res.status(200).json({ 
      success: true, 
      data: emailResult,
      testData: testData 
    });
  } catch (error) {
    console.error('Test email sending error:', error);
    return res.status(500).json({ error: 'Failed to send test email notification' });
  }
} 