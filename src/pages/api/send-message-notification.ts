import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { renderMessageNotificationEmail } from '@/lib/email-renderer';

// Validate Resend API key
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    const { recipientEmail, recipientName, senderName, listingTitle, messagePreview } = req.body;

    // Input validation
    if (!recipientEmail || !recipientName || !senderName) {
      console.error('❌ Missing required fields:', { 
        recipientEmail: !!recipientEmail, 
        recipientName: !!recipientName, 
        senderName: !!senderName 
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['recipientEmail', 'recipientName', 'senderName'],
        received: { 
          recipientEmail: !!recipientEmail, 
          recipientName: !!recipientName, 
          senderName: !!senderName 
        }
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      console.error('❌ Invalid recipient email format:', recipientEmail);
      return res.status(400).json({ 
        error: 'Invalid recipient email format',
        received: recipientEmail
      });
    }

    console.log('📧 Sending message notification to:', recipientEmail, 'from:', senderName);

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Email service not configured',
        details: 'RESEND_API_KEY environment variable is missing'
      });
    }

    // Generate dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?tab=messages`;

    // Render email template
    let emailHtml: string;
    try {
      emailHtml = renderMessageNotificationEmail({
        recipientName,
        senderName,
        listingTitle,
        messagePreview,
        dashboardUrl
      });
      console.log('✅ Message notification template rendered successfully');
    } catch (templateError) {
      console.error('❌ Message notification template rendering failed:', templateError);
      return res.status(500).json({ 
        error: 'Failed to render email template',
        details: templateError instanceof Error ? templateError.message : 'Unknown error'
      });
    }

    // Send email with retry logic
    let emailResult;
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Sending message notification (attempt ${attempt}/${maxRetries})...`);
        
        emailResult = await resend.emails.send({
          from: 'YourNextLease <notification@yournextlease.com>',
          to: [recipientEmail],
          subject: `New message from ${senderName} on YourNextLease`,
          html: emailHtml,
        });

        console.log('✅ Message notification sent successfully:', {
          id: emailResult.data?.id || 'unknown',
          to: recipientEmail,
          from: senderName,
          attempt
        });
        break; // Success, exit retry loop
        
      } catch (sendError: any) {
        lastError = sendError;
        console.error(`❌ Message notification send attempt ${attempt} failed:`, {
          error: sendError.message,
          code: sendError.code,
          statusCode: sendError.statusCode
        });

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!emailResult) {
      console.error('❌ All message notification send attempts failed');
      return res.status(500).json({ 
        error: 'Failed to send message notification after multiple attempts',
        details: lastError?.message || 'Unknown error',
        attempts: maxRetries
      });
    }

    // Log success metrics
    console.log('📊 Message notification metrics:', {
      recipient: recipientEmail,
      sender: senderName,
      template: 'message-notification',
      status: 'sent',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true, 
      data: emailResult,
      metrics: {
        recipient: recipientEmail,
        sender: senderName,
        template: 'message-notification',
        status: 'sent',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Message notification sending error:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    return res.status(500).json({ 
      error: 'Failed to send message notification',
      details: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 