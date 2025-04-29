const pool = require('../db/db_config').pool;
const { transporter, mailGenerator } = require('../config/email');

class PriceAlertService {
  constructor() {
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
    this.intervalId = null; // Add property to store interval ID
  }

  async start() {
    if (this.intervalId) {
      console.log('Price alert service already running.');
      return;
    }
    console.log('Starting price alert service...');
    // Store the interval ID
    this.intervalId = setInterval(() => this.checkAlerts(), this.checkInterval);
    // Optional: Run check immediately on start
    // this.checkAlerts(); 
  }

  // Add stop method
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Stopped price alert service.');
    }
  }

  async checkAlerts() {
    const query = `
      SELECT w.*, u.email, u.username, a.symbol, a.price as current_price
      FROM watchlist w
      JOIN users u ON w.user_id = u.id
      JOIN assets a ON w.asset_id = a.id
      WHERE w.alert_price IS NOT NULL 
      AND w.alert_triggered = 0
    `;

    try {
      // Use callback style if pool doesn't support .promise()
      pool.query(query, async (err, alerts) => {
        if (err) {
          console.error('Price alert check query error:', err);
          return;
        }
        
        for (const alert of alerts) {
          if (this.shouldTriggerAlert(alert)) {
            await this.sendAlertEmail(alert);
            await this.markAlertTriggered(alert.id);
          }
        }
      });
    } catch (err) {
      // This catch might not be necessary if using callbacks fully
      console.error('Price alert check error (outer):', err);
    }
  }

  shouldTriggerAlert(alert) {
    if (alert.alert_type === 'above') {
      return alert.current_price >= alert.alert_price;
    }
    return alert.current_price <= alert.alert_price;
  }

  async sendAlertEmail(alert) {
    const email = {
      body: {
        name: alert.username,
        intro: `Your price alert for ${alert.symbol} has been triggered!`,
        table: {
          data: [
            {
              item: 'Asset',
              description: alert.symbol
            },
            {
              item: 'Alert Price',
              description: `$${alert.alert_price}`
            },
            {
              item: 'Current Price',
              description: `$${alert.current_price}`
            }
          ]
        },
        action: {
          instructions: 'Click the button below to view the asset:',
          button: {
            text: 'View Asset',
            link: `http://localhost:8080/trade/${alert.asset_id}`
          }
        }
      }
    };

    const emailBody = mailGenerator.generate(email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: alert.email,
      subject: `TradeBlazer Price Alert: ${alert.symbol}`,
      html: emailBody
    };

    await transporter.sendMail(mailOptions);
  }

  async markAlertTriggered(alertId) {
    // Use callback style for consistency
    pool.query(
      'UPDATE watchlist SET alert_triggered = 1 WHERE id = ?',
      [alertId],
      (err, result) => {
        if (err) {
          console.error(`Error marking alert ${alertId} as triggered:`, err);
        }
      }
    );
  }
}

module.exports = new PriceAlertService();
