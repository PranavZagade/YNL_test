import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📧 Listing alert API called with body:', req.body);
    
    const {
      recipientEmail,
      recipientName,
      city,
      moveInDate,
      moveOutDate,
      matchedListings
    } = req.body;

    // Validate required fields
    if (!recipientEmail || !recipientName || !city || !moveInDate || !moveOutDate || !matchedListings || !Array.isArray(matchedListings)) {
      console.error('❌ Missing required fields:', {
        recipientEmail: !!recipientEmail,
        recipientName: !!recipientName,
        city: !!city,
        moveInDate: !!moveInDate,
        moveOutDate: !!moveOutDate,
        matchedListings: !!matchedListings,
        isArray: Array.isArray(matchedListings)
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('✅ All required fields present. Sending listing alert email to:', recipientEmail);
    console.log('📋 Found', matchedListings.length, 'matching listings');

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Generate email HTML with multiple listings
    console.log('🔄 Generating email HTML...');
    const emailHtml = renderListingAlertEmail({
      recipientName,
      city,
      moveInDate,
      moveOutDate,
      matchedListings
    });
    console.log('✅ Email HTML generated successfully');

    // Send email
    console.log('📤 Sending email via Resend...');
    const emailResult = await resend.emails.send({
      from: 'YourNextLease <notification@yournextlease.com>',
      to: [recipientEmail],
      subject: `We found ${matchedListings.length} listing${matchedListings.length > 1 ? 's' : ''} matching your preferences!`,
      html: emailHtml,
    });

    console.log('✅ Listing alert email sent successfully:', emailResult);

    return res.status(200).json({ 
      success: true, 
      data: emailResult 
    });
  } catch (error: any) {
    console.error('❌ Listing alert email sending error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to send listing alert email',
      details: error.message 
    });
  }
}

function renderListingAlertEmail(props: {
  recipientName: string;
  city: string;
  moveInDate: string;
  moveOutDate: string;
  matchedListings: Array<{
    id: string;
    title: string;
    city: string;
    rent: string;
    address: string;
    propertyName: string;
    listingUrl: string;
  }>;
}): string {
  const { recipientName, city, moveInDate, moveOutDate, matchedListings } = props;
  
  const listingsHtml = matchedListings.map(listing => `
    <div style="
      background-color: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
    ">
      <h4 style="
        color: #1f2937;
        font-size: 16px;
        margin: 0 0 8px 0;
        font-weight: 600;
      ">
        ${listing.title}
      </h4>
      <p style="
        color: #6b7280;
        font-size: 14px;
        margin: 0 0 10px 0;
      ">
        ${listing.propertyName} • ${listing.address}
      </p>
      <div style="
        display: flex;
        align-items: center;
        gap: 20px;
        font-size: 14px;
        margin-bottom: 15px;
      ">
        <div>
          <strong style="color: #374151">Rent:</strong>
          <p style="margin: 5px 0 0 0; color: #059669; font-weight: 600;">
            ${listing.rent}
          </p>
        </div>
        <div>
          <strong style="color: #374151">Location:</strong>
          <p style="margin: 5px 0 0 0; color: #6b7280;">
            ${listing.city}
          </p>
        </div>
      </div>
      <a href="${listing.listingUrl}" style="
        display: inline-block;
        background-color: #dc2626;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
      ">
        View Listing
      </a>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Listing Alert - YourNextLease</title>
    </head>
    <body style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background-color: #f9fafb;
      padding: 20px;
    ">
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        padding: 30px 20px;
        text-align: center;
        border-radius: 16px 16px 0 0;
      ">
        <h1 style="
          margin: 0;
          font-size: 28px;
          font-weight: bold;
          color: white;
        ">
          🎉 We Found Listings Matching Your Preferences!
        </h1>
        <p style="
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
          color: white;
        ">
          Great news! We found ${matchedListings.length} listing${matchedListings.length > 1 ? 's' : ''} in ${city} that match your saved preferences.
        </p>
      </div>

      <!-- Main Content -->
      <div style="
        background-color: white;
        padding: 30px 20px;
        border-radius: 0 0 16px 16px;
        border: 1px solid #e5e7eb;
        border-top: none;
      ">
        <!-- Greeting -->
        <div style="margin-bottom: 25px;">
          <h2 style="
            color: #1f2937;
            font-size: 20px;
            margin: 0 0 10px 0;
            font-weight: 600;
          ">
            Hi ${recipientName},
          </h2>
          <p style="
            color: #6b7280;
            font-size: 16px;
            line-height: 1.6;
            margin: 0;
          ">
            We found ${matchedListings.length} listing${matchedListings.length > 1 ? 's' : ''} in <strong>${city}</strong> that match your saved preferences!
          </p>
        </div>

        <!-- Alert Details -->
        <div style="
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        ">
          <h3 style="
            color: #dc2626;
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: 600;
          ">
            Your Alert Preferences
          </h3>
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 14px;
          ">
            <div>
              <strong style="color: #374151">Location:</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">${city}</p>
            </div>
            <div>
              <strong style="color: #374151">Move-in Date:</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">${moveInDate}</p>
            </div>
            <div>
              <strong style="color: #374151">Move-out Date:</strong>
              <p style="margin: 5px 0 0 0; color: #6b7280;">${moveOutDate}</p>
            </div>
          </div>
        </div>

        <!-- Matched Listings -->
        <div style="margin: 25px 0;">
          <h3 style="
            color: #0369a1;
            font-size: 18px;
            margin: 0 0 20px 0;
            font-weight: 600;
          ">
            🏠 Matching Listings Found
          </h3>
          
          ${listingsHtml}
        </div>

        <!-- Additional Info -->
        <div style="
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          font-size: 14px;
          color: #6b7280;
        ">
          <p style="margin: 0 0 8px 0;">
            <strong>💡 Tip:</strong> Act quickly! Good listings often get rented fast.
          </p>
          <p style="margin: 0;">
            You can manage your alerts anytime from your dashboard.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        text-align: center;
        padding: 20px;
        color: #6b7280;
        font-size: 14px;
      ">
        <p style="margin: 0 0 10px 0;">
          <strong>YourNextLease</strong><br>
          Your Next Lease, Made Easy.
        </p>
        <p style="margin: 0; font-size: 12px;">
          This email was sent because you have a listing alert set up for ${city}.
        </p>
      </div>
    </body>
    </html>
  `;
} 