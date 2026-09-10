'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ApiKeySection from '@/components/ApiKeySection';
import MemoSection from '@/components/MemoSection';
import FooterSection from '@/components/FooterSection';
import CustomerSection from '@/components/CustomerSection';
import ProductSection from '@/components/ProductSection';
import InvoicePreview from '@/components/InvoicePreview';
import ProcessLogSection from '@/components/ProcessLogSection';
import { LineItem, CustomerInput, DispatchResult, DispatchLogEvent, DispatchSettings } from '@/types/invoice';

export default function Dashboard() {
  const [apiKey, setApiKey] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  // Section 2: Memo
  const [memo, setMemo] = useState('Thank you for your business! Please remit payment at your earliest convenience.');

  // Section 3: Footer & Terms
  const [footer, setFooter] = useState('Payment due upon receipt. For billing inquiries, contact accounting@yourcompany.com.');
  const [daysUntilDue, setDaysUntilDue] = useState(7);

  // Section 4: Customers (Recipient Emails)
  const [customers, setCustomers] = useState<CustomerInput[]>([
    { email: 'client@example.com', name: 'Acme Corp' },
  ]);

  // Section 5: Global Products & Prices
  const [currency, setCurrency] = useState('usd');
  const [items, setItems] = useState<LineItem[]>([
    {
      id: '1',
      description: 'Professional Consulting & Development Services',
      unitAmount: 250,
      quantity: 1,
    },
  ]);

  // Dispatching Process States & Logs
  const [dispatching, setDispatching] = useState(false);
  const [results, setResults] = useState<DispatchResult[]>([]);
  const [logs, setLogs] = useState<DispatchLogEvent[]>([]);
  const [progress, setProgress] = useState(0);

  const addLog = (type: DispatchLogEvent['type'], message: string, details?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        timestamp,
        type,
        message,
        details,
      },
      ...prev,
    ]);
  };

  // Load saved API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('stripe_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      fetch('/api/stripe/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: savedKey }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setIsValidated(true);
            setAccountInfo(data.account);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleResetDefaults = () => {
    if (confirm('Reset all fields and items back to defaults?')) {
      setMemo('Thank you for your business! Please remit payment at your earliest convenience.');
      setFooter('Payment due upon receipt. For billing inquiries, contact accounting@yourcompany.com.');
      setDaysUntilDue(7);
      setCurrency('usd');
      setCustomers([{ email: 'client@example.com', name: 'Acme Corp' }]);
      setItems([
        {
          id: '1',
          description: 'Professional Consulting & Development Services',
          unitAmount: 250,
          quantity: 1,
        },
      ]);
      setResults([]);
      setLogs([]);
      setProgress(0);
    }
  };

  const handleClearLogs = () => {
    setResults([]);
    setLogs([]);
    setProgress(0);
  };

  // Batch Dispatch Engine
  const handleDispatchAll = async () => {
    const validItems = items.filter((i) => i.description.trim() && Number(i.unitAmount) > 0);
    if (!isValidated || !apiKey || customers.length === 0 || validItems.length === 0) return;

    setDispatching(true);
    setProgress(0);

    const initialResults: DispatchResult[] = customers.map((c) => ({
      email: c.email,
      name: c.name,
      status: 'pending',
    }));
    setResults(initialResults);

    addLog('start', `Initiated batch dispatch pipeline for ${customers.length} recipient(s)...`);

    const updatedResults: DispatchResult[] = [...initialResults];
    let successCount = 0;
    let failCount = 0;

    const settings: DispatchSettings = {
      memo,
      footer,
      currency,
      daysUntilDue,
      autoAdvance: true,
    };

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const startTime = Date.now();

      // Mark as processing
      updatedResults[i] = {
        ...updatedResults[i],
        status: 'processing',
      };
      setResults([...updatedResults]);

      addLog('info', `[${i + 1}/${customers.length}] Processing customer: ${customer.email}...`);

      try {
        const res = await fetch('/api/stripe/dispatch-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            email: customer.email,
            name: customer.name,
            items: validItems,
            settings,
          }),
        });

        const data = await res.json();
        const duration = Date.now() - startTime;

        if (data.success) {
          successCount++;
          updatedResults[i] = {
            email: customer.email,
            name: customer.name,
            status: 'success',
            invoiceId: data.invoice.id,
            invoiceNumber: data.invoice.number,
            hostedInvoiceUrl: data.invoice.hostedInvoiceUrl,
            invoicePdf: data.invoice.invoicePdf,
            total: data.invoice.total,
            currency: data.invoice.currency,
            durationMs: duration,
          };
          addLog(
            'success',
            `Invoice #${data.invoice.number || data.invoice.id} successfully created & sent to ${customer.email} (${duration}ms)`
          );
        } else {
          failCount++;
          updatedResults[i] = {
            email: customer.email,
            name: customer.name,
            status: 'error',
            error: data.error || 'Failed to dispatch invoice via Stripe.',
            durationMs: duration,
          };
          addLog('error', `Failed sending invoice to ${customer.email}: ${data.error || 'Unknown error'}`);
        }
      } catch (err: any) {
        const duration = Date.now() - startTime;
        failCount++;
        updatedResults[i] = {
          email: customer.email,
          name: customer.name,
          status: 'error',
          error: 'Network request error.',
          durationMs: duration,
        };
        addLog('error', `Network error during dispatch to ${customer.email}`);
      }

      setResults([...updatedResults]);
      setProgress(Math.round(((i + 1) / customers.length) * 100));
    }

    setDispatching(false);

    addLog(
      'complete',
      `Batch dispatch completed: ${successCount} successful, ${failCount} failed out of ${customers.length} recipients.`
    );

    if (successCount > 0) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Background radial glow & grid patterns */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,rgba(99,102,241,0.14),rgba(255,255,255,0))]"></div>
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Top Header Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">
                  Stripe Invoice Dispatcher
                </h1>
                <span className="text-[10px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Automated Stripe billing, batch customer invoicing & dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleResetDefaults}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
              title="Reset form fields to template defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Form</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px] text-indigo-300">Stripe API 2025</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ROW 1: Section 1 - API Integration (Stripe Key Engine) */}
        <div>
          <ApiKeySection
            apiKey={apiKey}
            setApiKey={setApiKey}
            isValidated={isValidated}
            setIsValidated={setIsValidated}
            accountInfo={accountInfo}
            setAccountInfo={setAccountInfo}
          />
        </div>

        {/* ROW 2: Section 2 (Memo) & Section 3 (Footer) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Section 2: Memo */}
          <div className="h-full">
            <MemoSection memo={memo} setMemo={setMemo} />
          </div>

          {/* Section 3: Footer */}
          <div className="h-full">
            <FooterSection
              footer={footer}
              setFooter={setFooter}
              daysUntilDue={daysUntilDue}
              setDaysUntilDue={setDaysUntilDue}
            />
          </div>
        </div>

        {/* ROW 3: Section 4 (Customer Recipients) & Section 5 (Products & Prices) Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Section 4 - Customer Recipients */}
          <div>
            <CustomerSection customers={customers} setCustomers={setCustomers} />
          </div>

          {/* Right: Section 5 - Global Products & Prices */}
          <div>
            <ProductSection
              items={items}
              setItems={setItems}
              currency={currency}
              setCurrency={setCurrency}
            />
          </div>
        </div>

        {/* ROW 4: Invoice Summary & Dispatch (Left) & Live Dispatch & Process Monitor (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Invoice Summary & Dispatch Section */}
          <div className="lg:col-span-5">
            <InvoicePreview
              apiKey={apiKey}
              isValidated={isValidated}
              customers={customers}
              items={items}
              memo={memo}
              footer={footer}
              currency={currency}
              daysUntilDue={daysUntilDue}
              dispatching={dispatching}
              onDispatch={handleDispatchAll}
            />
          </div>

          {/* Right: Live Dispatch & Process Monitor Section */}
          <div className="lg:col-span-7">
            <ProcessLogSection
              dispatching={dispatching}
              results={results}
              logs={logs}
              progress={progress}
              totalCustomers={customers.length}
              onClearLogs={handleClearLogs}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
