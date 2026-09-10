'use client';

import React from 'react';
import { Package, Plus, Trash2, DollarSign, Layers } from 'lucide-react';
import { LineItem } from '@/types/invoice';

interface ProductSectionProps {
  items: LineItem[];
  setItems: (items: LineItem[]) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

const CURRENCIES = [
  { code: 'usd', symbol: '$', label: 'USD - US Dollar' },
  { code: 'eur', symbol: '€', label: 'EUR - Euro' },
  { code: 'gbp', symbol: '£', label: 'GBP - British Pound' },
  { code: 'cad', symbol: 'CA$', label: 'CAD - Canadian Dollar' },
  { code: 'aud', symbol: 'A$', label: 'AUD - Australian Dollar' },
  { code: 'jpy', symbol: '¥', label: 'JPY - Japanese Yen' },
  { code: 'inr', symbol: '₹', label: 'INR - Indian Rupee' },
];

export default function ProductSection({
  items,
  setItems,
  currency,
  setCurrency,
}: ProductSectionProps) {
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(7),
      description: '',
      unitAmount: 100,
      quantity: 1,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.unitAmount) || 0) * (Number(item.quantity) || 1),
    0
  );

  const activeCurrencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || '$';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              Section 5: Global Products & Line Items
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-normal">
                Pricing Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">Products, quantities, unit prices, and invoice currency</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Currency:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500 transition font-mono"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const itemTotal = (Number(item.unitAmount) || 0) * (Number(item.quantity) || 1);
          return (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl items-center group hover:border-slate-700 transition"
            >
              <div className="md:col-span-6 space-y-1">
                <label className="text-[11px] text-slate-400 font-medium md:hidden">Product / Item Description</label>
                <input
                  type="text"
                  placeholder="e.g. Web Development Consulting / Monthly Retainer"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] text-slate-400 font-medium md:hidden">Unit Price</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                    {activeCurrencySymbol}
                  </span>
                  <input
                    type="number"
                    min="0.5"
                    step="any"
                    value={item.unitAmount}
                    onChange={(e) => handleUpdateItem(item.id, 'unitAmount', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg pl-7 pr-2 py-2 text-sm text-slate-200 outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] text-slate-400 font-medium md:hidden">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition font-mono text-center"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-2 pt-2 md:pt-0">
                <div className="text-right flex-1 font-mono font-semibold text-slate-200 text-sm">
                  {activeCurrencySymbol}
                  {itemTotal.toFixed(2)}
                </div>
                <button
                  type="button"
                  disabled={items.length <= 1}
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500 transition rounded-lg hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-800 gap-3">
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2.5 rounded-xl border border-amber-500/20 transition w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Line Item
        </button>

        <div className="flex items-center gap-3 bg-slate-950 px-5 py-2.5 rounded-xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Invoice Amount:</span>
          <span className="text-lg font-mono font-bold text-amber-400">
            {activeCurrencySymbol}
            {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-xs uppercase text-slate-500">{currency}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
