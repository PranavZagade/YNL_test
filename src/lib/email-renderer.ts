import React from 'react';
import { renderToString } from 'react-dom/server';

export function renderEmailTemplate(component: React.ReactElement): string {
  return renderToString(component);
}

export function renderMessageNotificationEmail(props: {
  recipientName: string;
  senderName: string;
  listingTitle?: string;
  messagePreview?: string;
  dashboardUrl: string;
}): string {
  const { MessageNotificationEmail } = require('../templates/emails/message-notification');
  
  const emailComponent = React.createElement(MessageNotificationEmail, props);
  return renderEmailTemplate(emailComponent);
}

export function renderWelcomeEmail(props: {
  userName: string;
  dashboardUrl: string;
}): string {
  const { WelcomeEmail } = require('../templates/emails/welcome-email');
  
  const emailComponent = React.createElement(WelcomeEmail, props);
  return renderEmailTemplate(emailComponent);
}

export function renderListingInterestEmail(props: {
  hostName: string;
  interestedUserName: string;
  listingTitle: string;
  listingUrl: string;
  dashboardUrl: string;
}): string {
  const { ListingInterestEmail } = require('../templates/emails/listing-interest');
  
  const emailComponent = React.createElement(ListingInterestEmail, props);
  return renderEmailTemplate(emailComponent);
}

export function renderListingAlertEmail(props: {
  recipientName: string;
  city: string;
  moveInDate: string;
  moveOutDate: string;
  listingTitle: string;
  propertyName: string;
  rent: string;
  address: string;
  listingUrl: string;
}): string {
  const { default: ListingAlertEmail } = require('../templates/emails/listing-alert');
  
  const emailComponent = React.createElement(ListingAlertEmail, props);
  return renderEmailTemplate(emailComponent);
} 