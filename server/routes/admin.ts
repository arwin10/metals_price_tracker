import { Router, Response } from 'express';
import { supabase } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get system statistics (Admin only)
router.get('/stats', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
    try {
        // Parallelize queries for better performance
        const [
            { count: userCount, error: userError },
            { count: portfolioCount, error: portfolioError },
            { count: alertCount, error: alertError },
            { count: holdingCount, error: holdingError }
        ] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('portfolios').select('*', { count: 'exact', head: true }),
            supabase.from('price_alerts').select('*', { count: 'exact', head: true }),
            supabase.from('portfolio_holdings').select('*', { count: 'exact', head: true })
        ]);

        if (userError) throw userError;
        if (portfolioError) throw portfolioError;
        if (alertError) throw alertError;
        if (holdingError) throw holdingError;

        // Get active alerts (simple filtering)
        const { count: activeAlertCount, error: activeAlertError } = await supabase
            .from('price_alerts')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        if (activeAlertError) throw activeAlertError;

        // Get database health check (simple query)
        const dbStatus = 'healthy'; // If we got here, DB is working.

        res.json({
            stats: {
                users: userCount,
                portfolios: portfolioCount,
                holdings: holdingCount,
                alerts: {
                    total: alertCount,
                    active: activeAlertCount
                }
            },
            system: {
                status: dbStatus,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

export default router;
