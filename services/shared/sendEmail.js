import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    let transporter;

    // Check if user has SMTP configured in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('Using configured SMTP provider.');
    } else {
      // Fallback: Create ethereal email account for testing/dev
      console.log('SMTP not fully configured in env. Creating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Storify Admin" <admin@storify.com>',
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    
    // If Ethereal email was used, print the preview URL
    if (info.envelope && info.envelope.to && info.envelope.to.length > 0 && !process.env.SMTP_HOST) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't block flow in dev if email fails
    return null;
  }
};
