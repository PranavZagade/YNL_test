import React from 'react';
import { BaseEmailTemplate, Icons } from './base-template';

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export function WelcomeEmail({
  userName,
  dashboardUrl
}: WelcomeEmailProps) {
  return (
    <BaseEmailTemplate
      title="Welcome to YourNextLease!"
      subtitle="Your Next Lease, Made Easy."
      actionButton={{
        text: "Get Started",
        url: dashboardUrl
      }}
      footerText="Welcome to the YourNextLease community!"
    >
      <div>
        <p style={{
          color: '#475569',
          lineHeight: '1.7',
          marginBottom: '24px',
          fontSize: '16px',
          fontWeight: '400'
        }}>
          Hi <strong style={{ color: '#1e293b', fontWeight: '600' }}>{userName}</strong>,
        </p>
        
        <p style={{
          color: '#475569',
          lineHeight: '1.7',
          marginBottom: '24px',
          fontSize: '16px',
          fontWeight: '400'
        }}>
          Welcome to YourNextLease! We're excited to help you find the perfect student housing or connect with other students looking for roommates.
        </p>

        {/* Features Section */}
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #fecaca',
          borderRadius: '20px',
          padding: '24px',
          margin: '24px 0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h3 style={{
            color: '#991b1b',
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
            What you can do on YourNextLease:
          </h3>
          
          <div>
            <p style={{
              color: '#991b1b',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              • Browse student housing listings
            </p>
            <p style={{
              color: '#991b1b',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              • List your own space for sublet
            </p>
            <p style={{
              color: '#991b1b',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              • Connect with potential roommates
            </p>
            <p style={{
              color: '#991b1b',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              • Message hosts and tenants directly
            </p>
            <p style={{
              color: '#991b1b',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0'
            }}>
              • Save your favorite listings
            </p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '20px',
          padding: '24px',
          margin: '24px 0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h4 style={{
            color: '#166534',
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
            Quick Start Guide
          </h4>
          
          <div>
            <p style={{
              color: '#166534',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              1. Complete your profile with your preferences
            </p>
            <p style={{
              color: '#166534',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              2. Browse listings in your preferred area
            </p>
            <p style={{
              color: '#166534',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0 0 8px 0'
            }}>
              3. Save interesting properties to your favorites
            </p>
            <p style={{
              color: '#166534',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: '0'
            }}>
              4. Message hosts to schedule viewings
            </p>
          </div>
        </div>

        {/* WhatsApp Community Section */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #25D366',
          borderRadius: '20px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.2), 0 2px 4px -1px rgba(37, 211, 102, 0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#25D366',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '28px'
          }}>
            <span style={{ color: 'white', fontSize: '28px' }}>💬</span>
          </div>
          <h3 style={{
            color: '#166534',
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
            Join Our WhatsApp Community
          </h3>
          <p style={{
            color: '#15803d',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '1.6',
            margin: '0 0 16px 0'
          }}>
            Connect with ASU students looking for housing. Get instant updates, roommate tips, and housing advice!
          </p>
          <a 
            href="https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO"
            style={{
              display: 'inline-block',
              backgroundColor: '#25D366',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 14px 0 rgba(37, 211, 102, 0.4)'
            }}
          >
            Join WhatsApp Group →
          </a>
        </div>

        <p style={{
          color: '#475569',
          lineHeight: '1.7',
          marginTop: '24px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          Ready to get started? Click the button above to explore listings or create your first post!
        </p>
      </div>
    </BaseEmailTemplate>
  );
} 