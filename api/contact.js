// Vercel Serverless Function — Contact Form → Resend API
// Replaces Formspree with direct email delivery

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, service, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Apex Website <noreply@${process.env.MAIL_DOMAIN || 'apexaerialsurveys.com'}>`,
        to: [process.env.CLIENT_EMAIL || 'info@apexaerialsurveys.com'],
        reply_to: email,
        subject: `New Enquiry from ${name}${service ? ` — ${service}` : ''}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px;">
            <h2 style="color: #0a1628; border-bottom: 2px solid #f97316; padding-bottom: 8px;">
              New Enquiry — Apex Aerial Surveys
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; color: #666; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>` : ''}
              ${service ? `<tr><td style="padding: 8px 0; color: #666;">Service</td><td style="padding: 8px 0;">${service}</td></tr>` : ''}
            </table>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 12px;">
              <p style="color: #666; margin: 0 0 4px; font-size: 13px;">Message</p>
              <p style="margin: 0; line-height: 1.6;">${message}</p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Sent from apexaerialsurveys.com contact form
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }

    return res.status(200).json({ success: true, message: 'Enquiry sent successfully.' });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}
