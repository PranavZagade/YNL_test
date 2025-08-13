export interface MessageNotificationData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  listingTitle?: string;
  messagePreview?: string;
}

export async function sendMessageNotification(data: MessageNotificationData) {
  try {
    const response = await fetch('/api/send-message-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }

    const result = await response.json();
    console.log('Email notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw error to avoid breaking the messaging flow
    return null;
  }
}

export async function sendMessageNotificationToUser(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  listingTitle?: string,
  messagePreview?: string
) {
  return sendMessageNotification({
    recipientEmail,
    recipientName,
    senderName,
    listingTitle,
    messagePreview,
  });
} 