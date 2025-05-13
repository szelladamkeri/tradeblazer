import { Router, Request, Response } from 'express';

export const verificationRouter = Router();

verificationRouter.post('/resend', async (req: Request, res: Response) => {
  // Placeholder for resending verification email
  res.status(200).json({ message: 'Resend verification email endpoint' });
}); 