import React from 'react';
import { BaseEmailTemplate } from './base-template';

interface MessageNotificationProps {
  recipientName: string;
  senderName: string;
  listingTitle?: string;
  messagePreview?: string;
  dashboardUrl: string;
}

export function MessageNotificationEmail({
  recipientName,
  senderName,
  listingTitle,
  messagePreview,
  dashboardUrl
}: MessageNotificationProps) {
  return (
    <BaseEmailTemplate
      title={`New message from ${senderName}`}
      subtitle="You have a new message!"
      actionButton={{
        text: "View Message",
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
          Hi <strong style={{ color: '#1e293b', fontWeight: '600' }}>{recipientName}</strong>,
        </p>
        
        <p style={{
          color: '#475569',
          lineHeight: '1.7',
          marginBottom: '24px',
          fontSize: '16px',
          fontWeight: '400'
        }}>
          You've received a new message from <strong style={{ color: '#1e293b', fontWeight: '600' }}>{senderName}</strong> on YourNextLease.
        </p>

        {/* Listing Context */}
        {listingTitle && (
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '20px',
            borderRadius: '16px',
            margin: '24px 0',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <p style={{
              margin: '0',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <strong style={{ color: '#1e293b' }}>Listing:</strong> {listingTitle}
            </p>
          </div>
        )}

        {/* Message Preview */}
        {messagePreview && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderLeft: '4px solid #e11d48',
            padding: '20px',
            margin: '24px 0',
            borderRadius: '16px',
            border: '1px solid #fecaca',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <p style={{
              margin: '0 0 8px 0',
              color: '#991b1b',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Message Preview
            </p>
            <p style={{
              margin: '0',
              color: '#991b1b',
              fontStyle: 'italic',
              fontSize: '14px',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              "{messagePreview.length > 120 ? messagePreview.substring(0, 120) + '...' : messagePreview}"
            </p>
          </div>
        )}

        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '20px',
          borderRadius: '16px',
          margin: '24px 0',
          border: '1px solid #bbf7d0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <p style={{
            margin: '0',
            color: '#166534',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Click the button above to view the full message and respond.
          </p>
        </div>
      </div>
    </BaseEmailTemplate>
  );
} 