import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import dotenv from 'dotenv';

dotenv.config();

// Configure email transporter using nodemailer
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Configure mailgen for email template generation
export const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'TradeBlazer',
    link: process.env.FRONTEND_URL || 'http://localhost:5173'
  }
});