import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import dotenv from 'dotenv';

dotenv.config();

// Configure email transporter using nodemailer
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure mailgen for email template generation
export const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'TradeBlazer',
    link: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
}); 