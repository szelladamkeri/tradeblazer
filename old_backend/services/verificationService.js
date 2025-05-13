const crypto = require('crypto');
const { transporter, mailGenerator } = require('../config/email');

/**
 * Generates a random verification token
 * @returns {string} A random hex string token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates a verification token with expiry time
 * @returns {Object} Token data with expiry time
 */
function createVerificationToken() {
  // Create token that expires in 24 hours
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  return {
    token: generateVerificationToken(),
    expiry: expiry
  };
}

/**
 * Sends verification email to a user
 * @param {Object} user - User object with email and name
 * @param {string} token - Verification token
 * @returns {Promise} Email sending result
 */
async function sendVerificationEmail(user, token) {
  // Fix the URL to point to your frontend instead of the backend API
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  
  console.log("Generated verification URL:", verificationUrl); // For debugging
  
  const emailContent = {
    body: {
      name: user.name || 'User',
      intro: 'Welcome to TradeBlazer! Please verify your account to get started.',
      action: {
        instructions: 'Click the button below to verify your email address:',
        button: {
          color: '#22BC66',
          text: 'Verify Your Account',
          link: verificationUrl
        }
      },
      outro: 'If you did not create this account, you can safely ignore this email.'
    }
  };
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `${process.env.EMAIL_SUBJECT_PREFIX} Email Verification`,
    html: mailGenerator.generate(emailContent)
  };
  
  return transporter.sendMail(mailOptions);
}

module.exports = {
  generateVerificationToken,
  createVerificationToken,
  sendVerificationEmail
};
