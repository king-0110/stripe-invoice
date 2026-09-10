import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { LineItem, DispatchSettings } from '@/types/invoice';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, email, name, items, settings } = body as {
      apiKey: string;
      email: string;
      name?: string;
      items: LineItem[];
      settings: DispatchSettings;
    };

    if (!apiKey) {
      return NextResponse.json({ error: 'Stripe API key is required.' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required.' }, { status: 400 });
    }

    const stripe = new Stripe(apiKey.trim(), {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Search or create customer
    const existingCustomers = await stripe.customers.list({
      email: normalizedEmail,
      limit: 1,
    });

    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: normalizedEmail,
        name: name?.trim() || undefined,
        description: 'Created via Stripe Invoice Dispatcher',
      });
      customerId = newCustomer.id;
    }

    const currency = (settings.currency || 'usd').toLowerCase();

    // 2. Create invoice items (line items attached to customer's upcoming invoice)
    for (const item of items) {
      const amountInCents = Math.round(Number(item.unitAmount) * 100);
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: amountInCents,
        currency: currency,
        description: item.description,
        quantity: item.quantity || 1,
      });
    }

    // 3. Create the draft invoice
    const daysUntilDue = settings.daysUntilDue ? Number(settings.daysUntilDue) : 7;

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: daysUntilDue,
      description: settings.memo ? settings.memo.trim() : undefined,
      footer: settings.footer ? settings.footer.trim() : undefined,
      auto_advance: settings.autoAdvance !== false, // auto finalize & attempt payment/email
    });

    // 4. Finalize invoice so it gets an invoice number, hosted invoice link, and PDF
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: true,
    });

    // 5. Explicitly send invoice email via Stripe
    let sentInvoice = finalizedInvoice;
    try {
      sentInvoice = await stripe.invoices.sendInvoice(finalizedInvoice.id);
    } catch (sendErr: any) {
      console.warn('Could not send email automatically (might already be auto-sent):', sendErr.message);
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: sentInvoice.id,
        number: sentInvoice.number,
        hostedInvoiceUrl: sentInvoice.hosted_invoice_url,
        invoicePdf: sentInvoice.invoice_pdf,
        status: sentInvoice.status,
        total: (sentInvoice.total || 0) / 100,
        currency: sentInvoice.currency,
      },
    });
  } catch (err: any) {
    console.error('Invoice dispatch error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to dispatch invoice via Stripe.',
      },
      { status: 500 }
    );
  }
}
