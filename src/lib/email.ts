export async function sendOrderConfirmationEmail(to: string, orderId: string, amount: number) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[EMAIL STUB] Order confirmation for ${orderId} (₹${amount}) would be sent to ${to}.`);
    console.log('To send real emails, set RESEND_API_KEY in your .env file and install the resend package.');
    return { success: true, stub: true };
  }

  // Example implementation using Resend (would require `npm i resend`)
  /*
  import { Resend } from 'resend';
  const resend = new Resend(apiKey);
  
  try {
    const data = await resend.emails.send({
      from: 'DesiCart <orders@desicart.com>',
      to: [to],
      subject: `Order Confirmed: ${orderId}`,
      html: `<strong>Thank you for your order!</strong><br>Your total amount is ₹${amount}.`,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed', error);
    return { success: false, error };
  }
  */
  
  return { success: true };
}
