export { BaseEmailTemplate } from './base-template';
export { MessageNotificationEmail } from './message-notification';
export { WelcomeEmail } from './welcome-email';
export { ListingInterestEmail } from './listing-interest';

// Email template types
export interface MessageNotificationProps {
  recipientName: string;
  senderName: string;
  listingTitle?: string;
  messagePreview?: string;
  dashboardUrl: string;
}

export interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export interface ListingInterestProps {
  hostName: string;
  interestedUserName: string;
  listingTitle: string;
  listingUrl: string;
  dashboardUrl: string;
} 