import { Pool, RowDataPacket } from 'mysql2/promise';
import { transporter, mailGenerator } from '../config/email';
import dotenv from 'dotenv';

dotenv.config();

class PriceAlertService {
  private checkInterval: number = 5 * 60 * 1000; // Check every 5 minutes
  private intervalId: NodeJS.Timeout | null = null;
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async start(): Promise<void> {
    if (this.intervalId) {
      console.log('Price alert service already running.');
      return;
    }
    console.log('Starting price alert service...');
    // Store the interval ID
    this.intervalId = setInterval(() => this.checkAlerts(), this.checkInterval);
    // Run check immediately on start
    await this.checkAlerts();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Stopped price alert service.');
    }
  }

  async checkAlerts(): Promise<void> {
    const query = `
      SELECT w.*, u.email, u.username, a.symbol, a.price as current_price
      FROM watchlist w
      JOIN users u ON w.user_id = u.id
      JOIN assets a ON w.asset_id = a.id
      WHERE w.alert_price IS NOT NULL 
      AND w.alert_triggered = 0
    `;

    try {
      const [alerts] = await this.pool.query<RowDataPacket[]>(query);
      for (const alert of alerts) {
        if (this.shouldTriggerAlert(alert)) {
          await this.sendAlertEmail(alert);
          await this.markAlertTriggered(alert.id);
        }
      }
    } catch (err: any) {
      console.error('Price alert check error:', err);
    }
  }

  shouldTriggerAlert(alert: any): boolean {
    if (alert.alert_type === 'above') {
      return alert.current_price >= alert.alert_price;
    }
    return alert.current_price <= alert.alert_price;
  }

  async sendAlertEmail(alert: any): Promise<void> {
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

  async markAlertTriggered(alertId: number): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE watchlist SET alert_triggered = 1 WHERE id = ?',
        [alertId]
      );
    } catch (err: any) {
      console.error(`Error marking alert ${alertId} as triggered:`, err);
    }
  }
}

export default PriceAlertService; 