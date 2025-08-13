import React from 'react';
import { BaseEmailTemplate, Icons } from './base-template';

interface ListingInterestProps {
  hostName: string;
  interestedUserName: string;
  listingTitle: string;
  listingUrl: string;
  dashboardUrl: string;
}

export function ListingInterestEmail({
  hostName,
  interestedUserName,
  listingTitle,
  listingUrl,
  dashboardUrl
}: ListingInterestProps) {
  return (
    <BaseEmailTemplate
      title="Someone is interested in your listing!"
      subtitle="You have a new inquiry"
      actionButton={{
        text: "View Inquiry",
        url: dashboardUrl
      }}
    >
      <div>
        <p style={{
          color: '#475569',
          lineHeight: '1.7',
          marginBottom: '24px',
          fontSize: '16px',
          fontWeight: '400'
        }}>
          Hi <strong style={{ color: '#1e293b', fontWeight: '600' }}>{hostName}</strong>,
        </p>
        
        <p style={{
          color: '#475569',
          lineHeight: '1.7',
          marginBottom: '24px',
          fontSize: '16px',
          fontWeight: '400'
        }}>
          Great news! <strong style={{ color: '#1e293b', fontWeight: '600' }}>{interestedUserName}</strong> is interested in your listing and would like to connect with you.
        </p>

        {/* Listing Details */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '20px',
          borderRadius: '16px',
          margin: '24px 0',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
              borderRadius: '50%',
              flexShrink: '0'
            }} />
            <p style={{
              margin: '0',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <strong style={{ color: '#1e293b' }}>Listing:</strong> {listingTitle}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #fecaca',
          borderRadius: '20px',
          padding: '24px',
          margin: '24px 0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: '0',
              color: 'white'
            }}>
              <Icons.list />
            </div>
            <h3 style={{
              color: '#991b1b',
              margin: '0',
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '-0.025em'
            }}>
              Next Steps:
            </h3>
          </div>
          
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {[
              { icon: <Icons.message />, text: 'Check your dashboard for the message' },
              { icon: <Icons.user />, text: 'Respond to their inquiry promptly' },
              { icon: <Icons.calendar />, text: 'Schedule a viewing if interested' },
              { icon: <Icons.check />, text: 'Keep communication professional and clear' }
            ].map((step, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: '0',
                  color: '#991b1b'
                }}>
                  {step.icon}
                </div>
                <span style={{
                  color: '#991b1b',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          padding: '20px',
          margin: '24px 0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: '#22c55e',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: '0',
              color: 'white'
            }}>
              <Icons.lightbulb />
            </div>
            <p style={{
              margin: '0',
              color: '#166534',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <strong>Pro Tip:</strong> Quick responses increase your chances of successful matches!
            </p>
          </div>
        </div>

        <p style={{
          color: '#475569',
          lineHeight: '1.7',
          marginTop: '24px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          Click the button above to view the full inquiry and start a conversation!
        </p>
      </div>
    </BaseEmailTemplate>
  );
} 