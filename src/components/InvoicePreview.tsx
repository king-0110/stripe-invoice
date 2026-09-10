'use client';

import React from 'react';
import { Send, FileCheck, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { LineItem, CustomerInput } from '@/types/invoice';

interface InvoicePreviewProps {
  apiKey: string;
  isValidated: boolean;
  customers: CustomerInput[];
  items: LineItem[];
  memo: string;
  footer: string;
  currency: string;
  daysUntilDue: number;
  dispatching: boolean;
  onDispatch: () => void;
}

export default function InvoicePreview({
  apiKey,
  isValidated,
  customers,
  items,
  memo,
  footer,
  currency,
  daysUntilDue,
  dispatching,
  onDispatch,
}: InvoicePreviewProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.unitAmount) || 0) * (Number(item.quantity) || 1),
    0
  );

  const currencySymbol =
    currency.toLowerCase() === 'eur'
      ? '€'
      : currency.toLowerCase() === 'gbp'
      ? '£'
      : currency.toLowerCase() === 'jpy'
      ? '¥'
      : currency.toLowerCase() === 'inr'
      ? '₹'
      : '$';

  const validItems = items.filter((i) => i.description.trim() && Number(i.unitAmount) > 0);
  const isReadyToDispatch = isValidated && apiKey && customers.length > 0 && validItems.length > 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Invoice Summary & Dispatch</h3>
              <p className="text-xs text-slate-400">Live preview of invoice parameters</p>
            </div>
          </div>
        </div>

        {/* Live Invoice Spec Box */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-start text-xs border-b border-slate-800/80 pb-3">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">Recipients</span>
              <span className="font-medium text-slate-200 text-sm">
                {customers.length} customer(s) queued
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block uppercase text-[10px] tracking-wider">Due Term</span>
              <span className="font-mono text-emerald-400 font-semibold">{daysUntilDue} Days</span>
            </div>
          </div>

          {/* Line items summary */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Line Items
            </span>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 truncate max-w-[200px]">
                  {item.quantity}x {item.description || '(No description)'}
                </span>
                <span className="text-slate-200">
                  {currencySymbol}
                  {((Number(item.unitAmount) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-mono font-bold text-amber-400 border-t border-slate-800 pt-2 mt-1">
              <span>Subtotal per Invoice:</span>
              <span>
                {currencySymbol}
                {subtotal.toFixed(2)} {currency.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Memo & Footer Preview */}
          {(memo || footer) && (
            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              {memo && (
                <div>
                  <span className="text-[10px] text-sky-400 uppercase tracking-wider block font-semibold">
                    Memo:
                  </span>
                  <p className="text-slate-400 italic text-[11px] bg-slate-900/50 p-2 rounded-lg border border-slate-800 mt-0.5">
                    &quot;{memo}&quot;
                  </p>
                </div>
              )}
              {footer && (
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">
                    Footer / Terms:
                  </span>
                  <p className="text-slate-400 italic text-[11px] bg-slate-900/50 p-2 rounded-lg border border-slate-800 mt-0.5">
                    &quot;{footer}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Warnings & Dispatch Action */}
      <div className="space-y-4">
        {!isValidated && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Connect your Stripe API Key before dispatching.</span>
          </div>
        )}

        {isValidated && customers.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Add at least 1 customer recipient in Section 4.</span>
          </div>
        )}

        <button
          type="button"
          onClick={onDispatch}
          disabled={!isReadyToDispatch || dispatching}
          className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-semibold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:cursor-not-allowed text-sm"
        >
          {dispatching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Dispatching Invoices...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Dispatch Invoices ({customers.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
