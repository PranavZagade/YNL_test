import React from 'react';

interface BaseEmailTemplateProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: {
    text: string;
    url: string;
  };
  footerText?: string;
}

// SVG Icons for better visual quality
const Icons = {
  house: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>🏠</span>,
  message: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>💬</span>,
  check: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>✅</span>,
  star: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>⭐</span>,
  user: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>👤</span>,
  calendar: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>📅</span>,
  heart: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>❤️</span>,
  search: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>🔍</span>,
  rocket: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>🚀</span>,
  lightbulb: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>💡</span>,
  list: () => <span style={{ fontSize: '18px', color: 'currentColor' }}>📋</span>
};

export function BaseEmailTemplate({
  children,
  title,
  subtitle,
  actionButton,
  footerText = "This email was sent because you have an account on YourNextLease."
}: BaseEmailTemplateProps) {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '0',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Container */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        margin: '20px',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
          color: 'white',
          padding: '40px 30px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'radial-gradient(circle at 20% 80%, rgba(225, 29, 72, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          {/* Brand */}
          <div style={{
            position: 'relative',
            zIndex: '1'
          }}>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '32px',
              fontWeight: '800',
              letterSpacing: '-0.025em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              YourNextLease
            </h1>
            
            <p style={{
              margin: '0',
              opacity: '0.8',
              fontSize: '16px',
              fontWeight: '400',
              letterSpacing: '0.025em',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              {subtitle || 'Your Next Lease, Made Easy.'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '40px 30px',
          backgroundColor: '#ffffff'
        }}>
          <h2 style={{
            color: '#1e293b',
            marginBottom: '24px',
            fontSize: '24px',
            fontWeight: '700',
            letterSpacing: '-0.025em',
            lineHeight: '1.3'
          }}>
            {title}
          </h2>

          {children}

          {/* Action Button */}
          {actionButton && (
            <div style={{
              textAlign: 'center',
              margin: '40px 0 20px 0'
            }}>
              <a
                href={actionButton.url}
                style={{
                  background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  textDecoration: 'none',
                  borderRadius: '16px',
                  fontWeight: '600',
                  display: 'inline-block',
                  fontSize: '16px',
                  boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.4)',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.025em',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '200px'
                }}

              >
                {actionButton.text}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: '30px',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{
            color: '#64748b',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <p style={{
              margin: '0 0 16px 0',
              fontWeight: '500',
              color: '#475569'
            }}>
              Best regards,<br />
              <span style={{ fontWeight: '600', color: '#1e293b' }}>The YourNextLease Team</span>
            </p>
            
            {/* WhatsApp Community Link */}
            <div style={{
              borderTop: '1px solid #cbd5e1',
              paddingTop: '16px',
              marginTop: '16px'
            }}>
              <a 
                href="https://chat.whatsapp.com/F6AIVNsVXlT7Ana3ZLcXJO"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#25D366',
                  color: 'white',
                  padding: '10px 20px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '8px'
                }}
              >
                💬 Join our WhatsApp Community
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{
        textAlign: 'center',
        margin: '20px',
        color: '#94a3b8',
        fontSize: '12px',
        lineHeight: '1.5'
      }}>
        <p style={{ margin: '0 0 4px 0' }}>
          {footerText}
        </p>
        <p style={{ margin: '0' }}>
          If you don&#39;t want to receive these notifications, you can update your preferences in your dashboard.
        </p>
      </div>
    </div>
  );
}

// Export icons for use in other templates
export { Icons }; 