import { Router, Response } from 'express';
import { supabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

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

    // Fetch portfolios with their holdings to calculate summary stats
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_holdings (*)
      `)
      .eq('user_id', userId!)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Process the data to match the expected response format
    const processedPortfolios = portfolios?.map((p: any) => {
      const holdings = p.portfolio_holdings || [];
      const totalInvested = holdings.reduce((sum: number, h: any) => sum + (h.quantity * h.purchase_price), 0);

      return {
        ...p,
        holdings_count: holdings.length,
        total_invested: totalInvested
      };
    });

    res.json({ portfolios: processedPortfolios });
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

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert([
        {
          user_id: userId,
          name,
          description: description || null
        } as any
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ portfolio });
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
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId!)
      .single();

    if (portfolioError || !portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    // Get holdings
    const { data: holdingsData, error: holdingsError } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', id)
      .order('purchase_date', { ascending: false });

    if (holdingsError) throw holdingsError;

    // Get current prices (similar logic to prices route)
    const { data: pricesData, error: pricesError } = await supabase
      .from('metal_prices')
      .select('*')
      .in('metal_type', ['gold', 'silver', 'platinum', 'palladium'])
      .order('timestamp', { ascending: false }); // Get recent prices

    if (pricesError) throw pricesError;

    // Extract latest price for each metal
    const latestPrices = new Map<string, number>();
    pricesData?.forEach((row: any) => {
      if (!latestPrices.has(row.metal_type)) {
        latestPrices.set(row.metal_type, Number(row.price_usd));
      }
    });

    // Calculate portfolio value and performance
    const holdings = holdingsData.map((holding: any) => {
      const currentPrice = latestPrices.get(holding.metal_type) || 0;
      const quantity = Number(holding.quantity);
      const purchasePrice = Number(holding.purchase_price);

      const currentValue = quantity * currentPrice;
      const purchaseValue = quantity * purchasePrice;
      const gain = currentValue - purchaseValue;
      const gainPercentage = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

      return {
        ...holding,
        currentPrice,
        currentValue,
        gain,
        gainPercentage,
      };
    });

    const totalCurrentValue = holdings.reduce((sum: number, h: any) => sum + h.currentValue, 0);
    const totalInvested = holdings.reduce((sum: number, h: any) => sum + (Number(h.quantity) * Number(h.purchase_price)), 0);
    const totalGain = totalCurrentValue - totalInvested;
    const totalGainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    res.json({
      portfolio,
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
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId!)
      .single();

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const { data: holding, error } = await supabase
      .from('portfolio_holdings')
      .insert([
        {
          portfolio_id: id,
          metal_type: metalType,
          quantity,
          unit,
          purchase_price: purchasePrice,
          purchase_date: purchaseDate,
          notes: notes || null
        } as any
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ holding });
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

    // Verify portfolio ownership using one query with inner join equivalent or separate check
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', userId!)
      .single();

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const { error } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('id', holdingId)
      .eq('portfolio_id', portfolioId);

    if (error) throw error;

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

    const { data, error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', userId!)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({ error: 'Failed to delete portfolio' });
  }
});

export default router;
