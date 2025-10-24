import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const alertSchema = z.object({
  metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']),
  targetPrice: z.number().positive(),
  condition: z.enum(['above', 'below']),
  currency: z.string().default('USD'),
});

// Get all alerts for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT * FROM price_alerts 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ alerts: result.rows });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create a new alert
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { metalType, targetPrice, condition, currency } = alertSchema.parse(req.body as any);

    const result = await pool.query(
      `INSERT INTO price_alerts 
       (user_id, metal_type, target_price, condition, currency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, metalType, targetPrice, condition, currency]
    );

    res.status(201).json({ alert: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Delete an alert
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params as any;

    const result = await pool.query(
      `DELETE FROM price_alerts 
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Get alert history
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT ah.*, pa.metal_type, pa.target_price, pa.condition
       FROM alert_history ah
       JOIN price_alerts pa ON ah.alert_id = pa.id
       WHERE pa.user_id = $1
       ORDER BY ah.triggered_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Error fetching alert history:', error);
    res.status(500).json({ error: 'Failed to fetch alert history' });
  }
});

export default router;
