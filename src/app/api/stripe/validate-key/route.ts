import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'API Key is required.' },
        { status: 400 }
      );
    }

    const trimmedKey = apiKey.trim();

    // Detect key type
    let keyType: 'secret' | 'restricted' | 'publishable' | 'unknown' = 'unknown';
    if (trimmedKey.startsWith('sk_')) keyType = 'secret';
    else if (trimmedKey.startsWith('rk_')) keyType = 'restricted';
    else if (trimmedKey.startsWith('pk_')) keyType = 'publishable';

    if (keyType === 'publishable') {
      return NextResponse.json(
        { valid: false, error: 'This is a publishable key (pk_). Invoicing requires a Secret (sk_) or Restricted (rk_) key.' },
        { status: 400 }
      );
    }

    if (keyType === 'unknown') {
      return NextResponse.json(
        { valid: false, error: 'Invalid key format. Stripe keys must start with sk_test_, sk_live_, rk_test_, or rk_live_.' },
        { status: 400 }
      );
    }

    const livemode = trimmedKey.includes('_live_');

    const stripe = new Stripe(trimmedKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    // Retrieve the account tied to the key
    const account = await (stripe.accounts.retrieve as any)();

    // Try to fetch balance (may fail on restricted keys without balance permission)
    let balance: {
      available: { amount: number; currency: string }[];
      pending: { amount: number; currency: string }[];
    } | null = null;
    try {
      const bal = await stripe.balance.retrieve();
      balance = {
        available: bal.available.map((b) => ({ amount: b.amount / 100, currency: b.currency })),
        pending: bal.pending.map((b) => ({ amount: b.amount / 100, currency: b.currency })),
      };
    } catch {
      balance = null;
    }

    // Try to fetch recent invoice count / stats (best-effort)
    let invoiceStats: { total: number } | null = null;
    try {
      const invoices = await stripe.invoices.list({ limit: 100 });
      invoiceStats = { total: invoices.data.length + (invoices.has_more ? 1 : 0) };
    } catch {
      invoiceStats = null;
    }

    return NextResponse.json({
      valid: true,
      account: {
        id: account.id,
        businessName:
          account.business_profile?.name ||
          account.settings?.dashboard?.display_name ||
          'Stripe Account',
        email: account.email || null,
        country: account.country || null,
        defaultCurrency: (account.default_currency || 'usd').toUpperCase(),
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        keyType,
        livemode,
        balance,
        invoiceStats,
      },
    });
  } catch (err: any) {
    let friendly = err.message || 'Failed to authenticate with Stripe.';
    if (err.type === 'StripeAuthenticationError') {
      friendly = 'Authentication failed. This API key is invalid, expired, or revoked.';
    } else if (err.type === 'StripePermissionError') {
      friendly = 'This restricted key lacks permission to read account details. Grant it read access.';
    }
    return NextResponse.json(
      { valid: false, error: friendly },
      { status: 401 }
    );
  }
}
