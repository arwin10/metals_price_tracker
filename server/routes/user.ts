import { Router, Response } from 'express';
import { supabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferredCurrency: z.string().optional(),
  notificationEnabled: z.boolean().optional(),
});

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, preferred_currency, notification_enabled, created_at')
      .eq('id', userId!)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).first_name,
        lastName: (user as any).last_name,
        role: (user as any).role,
        preferredCurrency: (user as any).preferred_currency,
        notificationEnabled: (user as any).notification_enabled,
        createdAt: (user as any).created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, preferredCurrency, notificationEnabled } = 
      profileUpdateSchema.parse(req.body as any);

    const updateData: any = {};

    if (firstName !== undefined) {
      updateData.first_name = firstName;
    }
    if (lastName !== undefined) {
      updateData.last_name = lastName;
    }
    if (preferredCurrency !== undefined) {
      updateData.preferred_currency = preferredCurrency;
    }
    if (notificationEnabled !== undefined) {
      updateData.notification_enabled = notificationEnabled;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await (supabase as any)
      .from('users')
      .update(updateData)
      .eq('id', userId!)
      .select('id, email, first_name, last_name, preferred_currency, notification_enabled')
      .single();

    if (error) throw error;

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        preferredCurrency: user.preferred_currency,
        notificationEnabled: user.notification_enabled,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
