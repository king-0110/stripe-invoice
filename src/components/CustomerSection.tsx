'use client';

import React, { useState } from 'react';
import { Mail, Users, UserPlus, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { CustomerInput } from '@/types/invoice';

interface CustomerSectionProps {
  customers: CustomerInput[];
  setCustomers: (customers: CustomerInput[]) => void;
}

export default function CustomerSection({ customers, setCustomers }: CustomerSectionProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('bulk');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleName, setSingleName] = useState('');
  const [bulkText, setBulkText] = useState('');

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail || !singleEmail.includes('@')) return;

    if (customers.some((c) => c.email.toLowerCase() === singleEmail.toLowerCase().trim())) {
      setSingleEmail('');
      setSingleName('');
      return;
    }

    setCustomers([...customers, { email: singleEmail.trim(), name: singleName.trim() || undefined }]);
    setSingleEmail('');
    setSingleName('');
  };

  const handleParseBulk = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const newCustomers: CustomerInput[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check if line format is "Name <email@example.com>" or "email@example.com, Name" or plain email
      let email = '';
      let name = '';

      if (trimmed.includes('<') && trimmed.includes('>')) {
        const parts = trimmed.split('<');
        name = parts[0].trim();
        email = parts[1].replace('>', '').trim();
      } else if (trimmed.includes(',')) {
        const parts = trimmed.split(',');
        email = parts[0].trim();
        name = parts[1].trim();
      } else {
        email = trimmed;
      }

      if (email && email.includes('@')) {
        newCustomers.push({ email: email.toLowerCase(), name: name || undefined });
      }
    });

    // Merge unique
    const map = new Map<string, CustomerInput>();
    [...customers, ...newCustomers].forEach((c) => {
      map.set(c.email.toLowerCase(), c);
    });

    setCustomers(Array.from(map.values()));
    setBulkText('');
  };

  const handleRemoveCustomer = (index: number) => {
    setCustomers(customers.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setCustomers([]);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              Section 4: Customer Recipients
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-mono font-medium">
                {customers.length} {customers.length === 1 ? 'Recipient' : 'Recipients'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Specify emails to dispatch invoices to (Stripe will auto-create missing customers)</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              mode === 'bulk'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Bulk Import
          </button>
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              mode === 'single'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Single Add
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleAddSingle} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="email"
            required
            placeholder="Customer Email *"
            value={singleEmail}
            onChange={(e) => setSingleEmail(e.target.value)}
            className="sm:col-span-2 bg-slate-950/70 border border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Name (Optional)"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition"
            />
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition shrink-0"
            >
              Add
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <textarea
            rows={3}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Enter emails (one per line or separated by commas):\nclient1@acme.com\nJane Doe <jane@acme.com>\nclient3@corp.org, John Corp`}
            className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition resize-none font-mono"
          />
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500">
              Supports formats: <code className="text-violet-400">email@domain.com</code> or <code className="text-violet-400">Name &lt;email@domain.com&gt;</code>
            </span>
            <button
              type="button"
              onClick={handleParseBulk}
              disabled={!bulkText.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
            >
              Parse & Append Recipients
            </button>
          </div>
        </div>
      )}

      {/* Recipient Badge List */}
      {customers.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Current Dispatch Queue ({customers.length}):</span>
            <button
              onClick={handleClearAll}
              className="text-rose-400 hover:text-rose-300 text-[11px] transition"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {customers.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 group hover:border-violet-500/40 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-mono text-slate-200">{c.email}</span>
                {c.name && <span className="text-slate-500 font-normal">({c.name})</span>}
                <button
                  onClick={() => handleRemoveCustomer(idx)}
                  className="text-slate-500 hover:text-rose-400 transition ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
