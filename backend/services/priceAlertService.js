const pool = require('../db/db_config').pool;
const { transporter, mailGenerator } = require('../config/email');

class PriceAlertService {
  constructor() {
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
  }

  async start() {
    setInterval(() => this.checkAlerts(), this.checkInterval);
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
      const [alerts] = await pool.query(query);
      
      for (const alert of alerts) {
        if (this.shouldTriggerAlert(alert)) {
          await this.sendAlertEmail(alert);
          await this.markAlertTriggered(alert.id);
        }
      }
    } catch (err) {
      console.error('Price alert check error:', err);
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
    await pool.query(
      'UPDATE watchlist SET alert_triggered = 1 WHERE id = ?',
      [alertId]
    );
  }
}

module.exports = new PriceAlertService();
