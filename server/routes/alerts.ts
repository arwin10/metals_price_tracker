import { Router, Response } from 'express';
import { supabase } from '../config/database';
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

    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId!)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ alerts: alerts || [] });
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

    const { data: alert, error } = await (supabase as any)
      .from('price_alerts')
      .insert([
        {
          user_id: userId!,
          metal_type: metalType,
          target_price: targetPrice,
          condition,
          currency,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ alert });
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

    const { data, error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId!)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
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

    const { data: history, error } = await supabase
      .from('alert_history')
      .select(`
        *,
        price_alerts (
          metal_type,
          target_price,
          condition
        )
      `)
      .eq('price_alerts.user_id', userId!)
      .order('triggered_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ history: history || [] });
  } catch (error) {
    console.error('Error fetching alert history:', error);
    res.status(500).json({ error: 'Failed to fetch alert history' });
  }
});

export default router;
