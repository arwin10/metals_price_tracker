import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 
        'NOT SET',
    },
    api: {
      goldApiAccessible: true, // We'll test this
    }
  };

  // Test Gold API connectivity
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    diagnostics.api.goldApiAccessible = response.ok;
  } catch (error) {
    diagnostics.api.goldApiAccessible = false;
  }

  const allConfigured = 
    diagnostics.supabase.hasUrl && 
    diagnostics.supabase.hasAnonKey && 
    diagnostics.supabase.hasServiceKey;

  return NextResponse.json({
    status: allConfigured ? 'OK' : 'CONFIGURATION_ERROR',
    message: allConfigured 
      ? 'All environment variables are configured' 
      : 'Missing required environment variables. Please check Vercel dashboard.',
    diagnostics,
    nextSteps: allConfigured ? [
      'Environment variables are set correctly',
      'Run: curl YOUR_URL/api/cron/update-prices to populate database',
      'Then test: curl YOUR_URL/api/prices/current'
    ] : [
      'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
      'Add: NEXT_PUBLIC_SUPABASE_URL (from Supabase Dashboard → Settings → API)',
      'Add: NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase Dashboard → Settings → API)',
      'Add: SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard → Settings → API)',
      'Redeploy after adding variables'
    ]
  });
}
