
import React from 'react';
import { BaseEmailTemplate } from './base-template';

interface AccountSetupEmailProps {
    userName: string;
    setupUrl: string;
}

export function AccountSetupEmail({
    userName,
    setupUrl
}: AccountSetupEmailProps) {
    return (
        <BaseEmailTemplate
            title="Welcome to YourNextLease!"
            subtitle="Complete your account setup"
            actionButton={{
                text: "Set Your Password",
                url: setupUrl
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
                    An account has been created for you on <strong>YourNextLease</strong>. Your listing has been approved and is now live!
                </p>

                <p style={{
                    color: '#475569',
                    lineHeight: '1.7',
                    marginBottom: '24px',
                    fontSize: '16px',
                    fontWeight: '400'
                }}>
                    To access your dashboard and manage your listing, please click the button below to set your password.
                </p>

                {/* Security Note */}
                <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    marginTop: '24px',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '18px', marginRight: '8px' }}>🔒</span>
                        <strong style={{ color: '#334155', fontSize: '14px' }}>Secure Account Setup</strong>
                    </div>
                    <p style={{
                        color: '#64748b',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        margin: '0'
                    }}>
                        This link is unique to you and will help you securely set up your password. If you didn't request this account, please ignore this email.
                    </p>
                </div>

            </div>
        </BaseEmailTemplate>
    );
}
