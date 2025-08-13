import React from 'react';

interface ListingAlertEmailProps {
  recipientName: string;
  city: string;
  moveInDate: string;
  moveOutDate: string;
  listingTitle: string;
  propertyName: string;
  rent: string;
  address: string;
  listingUrl: string;
}

export default function ListingAlertEmail({
  recipientName,
  city,
  moveInDate,
  moveOutDate,
  listingTitle,
  propertyName,
  rent,
  address,
  listingUrl
}: ListingAlertEmailProps) {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center',
        borderRadius: '16px 16px 0 0'
      }}>
        <h1 style={{
          margin: '0',
          fontSize: '28px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          🎉 New Listing Alert!
        </h1>
        <p style={{
          margin: '10px 0 0 0',
          fontSize: '16px',
          opacity: '0.9',
          color: 'white'
        }}>
          We found a listing that matches your preferences
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px 20px',
        borderRadius: '0 0 16px 16px',
        border: '1px solid #e5e7eb',
        borderTop: 'none'
      }}>
        {/* Greeting */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{
            color: '#1f2937',
            fontSize: '20px',
            margin: '0 0 10px 0',
            fontWeight: '600'
          }}>
            Hi {recipientName},
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            Great news! We found a new listing in <strong>{city}</strong> that matches your saved preferences.
          </p>
        </div>

        {/* Alert Details */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{
            color: '#dc2626',
            fontSize: '18px',
            margin: '0 0 15px 0',
            fontWeight: '600'
          }}>
            Your Alert Preferences
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div>
              <strong style={{ color: '#374151' }}>Location:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>{city}</p>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Move-in Date:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>{moveInDate}</p>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Move-out Date:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>{moveOutDate}</p>
            </div>
          </div>
        </div>

        {/* Listing Details */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{
            color: '#0369a1',
            fontSize: '18px',
            margin: '0 0 15px 0',
            fontWeight: '600'
          }}>
            🏠 Matching Listing Found
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{
              color: '#1f2937',
              fontSize: '16px',
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              {listingTitle}
            </h4>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: '0'
            }}>
              {propertyName} • {address}
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '14px'
          }}>
            <div>
              <strong style={{ color: '#374151' }}>Rent:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#059669', fontWeight: '600' }}>
                ${rent}/month
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <a href={listingUrl} style={{
            display: 'inline-block',
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '14px 28px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer'
          }}>
            View Listing Details
          </a>
        </div>

        {/* Additional Info */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '15px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>💡 Tip:</strong> Act quickly! Good listings often get rented fast.
          </p>
          <p style={{ margin: '0' }}>
            You can manage your alerts anytime from your dashboard.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>YourNextLease</strong><br />
          Your Next Lease, Made Easy.
        </p>
        <p style={{ margin: '0', fontSize: '12px' }}>
          This email was sent because you have a listing alert set up for {city}.
        </p>
      </div>
    </div>
  );
} 