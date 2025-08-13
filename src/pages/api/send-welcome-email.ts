import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { renderWelcomeEmail } from '@/lib/email-renderer';

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
    const { userEmail, userName } = req.body;

    // Input validation
    if (!userEmail || !userName) {
      console.error('❌ Missing required fields:', { userEmail: !!userEmail, userName: !!userName });
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userEmail', 'userName'],
        received: { userEmail: !!userEmail, userName: !!userName }
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.error('❌ Invalid email format:', userEmail);
      return res.status(400).json({ 
        error: 'Invalid email format',
        received: userEmail
      });
    }

    console.log('📧 Sending welcome email to:', userEmail, 'for user:', userName);

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Email service not configured',
        details: 'RESEND_API_KEY environment variable is missing'
      });
    }

    // Generate dashboard URL
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

    // Render email template
    let emailHtml: string;
    try {
      emailHtml = renderWelcomeEmail({
        userName,
        dashboardUrl
      });
      console.log('✅ Email template rendered successfully');
    } catch (templateError) {
      console.error('❌ Email template rendering failed:', templateError);
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
        console.log(`📤 Sending email (attempt ${attempt}/${maxRetries})...`);
        
        emailResult = await resend.emails.send({
          from: 'YourNextLease <notification@yournextlease.com>',
          to: [userEmail],
          subject: 'Welcome to YourNextLease! 🏠',
          html: emailHtml,
        });

        console.log('✅ Welcome email sent successfully:', {
          id: emailResult.data?.id || 'unknown',
          to: userEmail,
          attempt
        });
        break; // Success, exit retry loop
        
      } catch (sendError: any) {
        lastError = sendError;
        console.error(`❌ Email send attempt ${attempt} failed:`, {
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
      console.error('❌ All email send attempts failed');
      return res.status(500).json({ 
        error: 'Failed to send welcome email after multiple attempts',
        details: lastError?.message || 'Unknown error',
        attempts: maxRetries
      });
    }

    // Log success metrics
    console.log('📊 Welcome email metrics:', {
      recipient: userEmail,
      template: 'welcome-email',
      status: 'sent',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true, 
      data: emailResult,
      metrics: {
        recipient: userEmail,
        template: 'welcome-email',
        status: 'sent',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Welcome email sending error:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    return res.status(500).json({ 
      error: 'Failed to send welcome email',
      details: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 