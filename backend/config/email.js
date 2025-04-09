const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

// Add logging to debug environment variables
console.log('Email configuration:');
console.log('- User:', process.env.EMAIL_USER ? '✓ Set' : '✗ Missing');
console.log('- Password:', process.env.EMAIL_APP_PASSWORD ? '✓ Set' : '✗ Missing');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    debug: true // Enable debug logs
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Email service error:', error);
    } else {
        console.log('Email server is ready');
    }
});

// Configure email generator
const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'TradeBlazer',
        link: 'http://localhost:8080'
    }
});

module.exports = { transporter, mailGenerator };
