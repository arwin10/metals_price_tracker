import { Router, Response } from 'express';
import { supabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Temporary pool-like wrapper for complex queries
const pool = {
  query: async (sql: string, params?: any[]): Promise<{ rows: any[] }> => {
    // This is a temporary workaround - these queries need to be migrated to Supabase properly
    // For now, throwing error to indicate unimplemented
    throw new Error('Complex SQL queries need to be migrated to Supabase format');
  }
};

const router = Router();

const portfolioSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const holdingSchema = z.object({
  metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']),
  quantity: z.number().positive(),
  unit: z.string().default('oz'),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string(),
  notes: z.string().optional(),
});

// Get all portfolios for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT p.*, 
        COUNT(ph.id) as holdings_count,
        SUM(ph.quantity * ph.purchase_price) as total_invested
       FROM portfolios p
       LEFT JOIN portfolio_holdings ph ON p.id = ph.portfolio_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({ portfolios: result.rows });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

// Create a new portfolio
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, description } = portfolioSchema.parse(req.body);

    const result = await pool.query(
      `INSERT INTO portfolios (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, name, description]
    );

    res.status(201).json({ portfolio: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating portfolio:', error);
    res.status(500).json({ error: 'Failed to create portfolio' });
  }
});

// Get portfolio details with holdings
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    // Get portfolio
    const portfolioResult = await pool.query(
      `SELECT * FROM portfolios WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (portfolioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    // Get holdings
    const holdingsResult = await pool.query(
      `SELECT * FROM portfolio_holdings WHERE portfolio_id = $1 ORDER BY purchase_date DESC`,
      [id]
    );

    // Get current prices
    const pricesResult = await pool.query(
      `SELECT DISTINCT ON (metal_type) metal_type, price_usd
       FROM metal_prices
       ORDER BY metal_type, timestamp DESC`
    );

    const priceMap = Object.fromEntries(
      pricesResult.rows.map((row: any) => [row.metal_type, parseFloat(row.price_usd)])
    );

    // Calculate portfolio value and performance
    const holdings = holdingsResult.rows.map((holding: any) => {
      const currentPrice = priceMap[holding.metal_type] || 0;
      const currentValue = holding.quantity * currentPrice;
      const purchaseValue = holding.quantity * holding.purchase_price;
      const gain = currentValue - purchaseValue;
      const gainPercentage = (gain / purchaseValue) * 100;

      return {
        ...holding,
        currentPrice,
        currentValue,
        gain,
        gainPercentage,
      };
    });

    const totalCurrentValue = holdings.reduce((sum: number, h: any) => sum + h.currentValue, 0);
    const totalInvested = holdings.reduce((sum: number, h: any) => sum + (h.quantity * h.purchase_price), 0);
    const totalGain = totalCurrentValue - totalInvested;
    const totalGainPercentage = (totalGain / totalInvested) * 100;

    res.json({
      portfolio: portfolioResult.rows[0],
      holdings,
      summary: {
        totalCurrentValue,
        totalInvested,
        totalGain,
        totalGainPercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio details:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio details' });
  }
});

// Add holding to portfolio
router.post('/:id/holdings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { metalType, quantity, unit, purchasePrice, purchaseDate, notes } = holdingSchema.parse(req.body);

    // Verify portfolio ownership
    const portfolioCheck = await pool.query(
      `SELECT id FROM portfolios WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (portfolioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const result = await pool.query(
      `INSERT INTO portfolio_holdings 
       (portfolio_id, metal_type, quantity, unit, purchase_price, purchase_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, metalType, quantity, unit, purchasePrice, purchaseDate, notes]
    );

    res.status(201).json({ holding: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error adding holding:', error);
    res.status(500).json({ error: 'Failed to add holding' });
  }
});

// Delete holding
router.delete('/:portfolioId/holdings/:holdingId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { portfolioId, holdingId } = req.params;

    // Verify portfolio ownership
    const portfolioCheck = await pool.query(
      `SELECT id FROM portfolios WHERE id = $1 AND user_id = $2`,
      [portfolioId, userId]
    );

    if (portfolioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    await pool.query(
      `DELETE FROM portfolio_holdings WHERE id = $1 AND portfolio_id = $2`,
      [holdingId, portfolioId]
    );

    res.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    console.error('Error deleting holding:', error);
    res.status(500).json({ error: 'Failed to delete holding' });
  }
});

// Delete portfolio
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({ error: 'Failed to delete portfolio' });
  }
});

export default router;
