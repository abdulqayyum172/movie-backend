const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const axios = require('axios');

/**
 * Mailer Service
 * A professional wrapper around Nodemailer & Brevo with template support
 */
class MailerService {
  constructor() {
    this.useBrevo = !!process.env.BREVO_API_KEY;

    if (this.useBrevo) {
      console.log('Mailer is configured to use Brevo API');
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        pool: true, // Use connection pooling for better performance
        maxConnections: 5,
        maxMessages: 100,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Verify connection on startup (optional but recommended for debugging)
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Mailer connection error:', error.message);
        } else {
          console.log('Mailer is ready to send messages');
        }
      });
    }
  }

  parseEmailFrom(emailFromStr) {
    if (!emailFromStr) return { name: 'MovieBox', email: 'noreply@moviebox.com' };
    
    // Format could be: "Name <email@domain.com>" or just "email@domain.com"
    const match = emailFromStr.match(/^"?(.*?)"?\s*<(.*?)>$/);
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: 'MovieBox', email: emailFromStr.trim() };
  }

  /**
   * Generic method to send emails using EJS templates
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} templateName - Name of the .ejs file in templates folder
   * @param {object} context - Data to pass to the template
   */
  async sendWithTemplate(to, subject, templateName, context = {}) {
    try {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);
      
      // Inject global variables (like year, app URL) into context
      const templateData = {
        ...context,
        year: new Date().getFullYear(),
        appUrl: process.env.APP_URL || 'http://localhost:5173',
      };

      const html = await ejs.renderFile(templatePath, templateData);

      if (this.useBrevo || process.env.BREVO_API_KEY) {
        const senderInfo = this.parseEmailFrom(process.env.EMAIL_FROM);
        const response = await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: senderInfo,
            to: [{ email: to }],
            subject: subject,
            htmlContent: html,
          },
          {
            headers: {
              'accept': 'application/json',
              'api-key': process.env.BREVO_API_KEY,
              'content-type': 'application/json',
            },
          }
        );

        console.log(`Email sent via Brevo: ${response.data.messageId || 'success'} [Template: ${templateName}]`);
        return response.data;
      } else {
        const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || '"MovieBox" <noreply@moviebox.com>',
          to,
          subject,
          html,
        });

        console.log(`Email sent via SMTP: ${info.messageId} [Template: ${templateName}]`);
        return info;
      }
    } catch (error) {
      console.error(`Failed to send email [Template: ${templateName}]:`, error.response?.data || error.message || error);
      // In production, you might want to log this to a service like Sentry
      return null;
    }
  }

  /**
   * Specific helper for welcome emails
   */
  async sendWelcomeEmail(email, username) {
    return this.sendWithTemplate(
      email,
      'Welcome to MovieBox! 🍿',
      'welcome',
      { username }
    );
  }

  /**
   * Specific helper for verification email
   */
  async sendVerificationEmail(email, code) {
    return this.sendWithTemplate(
      email,
      'Your MovieBox Verification Code 🍿',
      'verification',
      { code }
    );
  }
}

// Export as a singleton
module.exports = new MailerService();
