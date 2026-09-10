'use client';

import React from 'react';
import { AlignLeft, Sparkles } from 'lucide-react';

interface FooterSectionProps {
  footer: string;
  setFooter: (footer: string) => void;
  daysUntilDue: number;
  setDaysUntilDue: (days: number) => void;
}

const FOOTER_PRESETS = [
  'Late payments are subject to a 1.5% monthly fee. Questions? Contact billing@company.com.',
  'Bank Transfer Details: IBAN US893700000123456789 | SWIFT/BIC: STRPA22.',
  'Thank you for partnering with us! All sales are covered under our Master Service Agreement.',
];

export default function FooterSection({
  footer,
  setFooter,
  daysUntilDue,
  setDaysUntilDue,
}: FooterSectionProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <AlignLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              Section 3: Invoice Footer
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-normal">
                Terms & Notes
              </span>
            </h2>
            <p className="text-xs text-slate-400">Payment terms, bank details, or legal footers on the invoice</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-medium text-slate-300">Footer Note / Terms Text</label>
          <textarea
            rows={3}
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="e.g. Please include invoice number on wire transfer details."
            className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition resize-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-300">Payment Due Term</label>
          <div className="bg-slate-950/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Days until due</span>
              <span className="font-mono text-emerald-400 font-bold">{daysUntilDue} Days</span>
            </div>
            <input
              type="range"
              min={1}
              max={90}
              value={daysUntilDue}
              onChange={(e) => setDaysUntilDue(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 Day</span>
              <span>30 Days</span>
              <span>90 Days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Terms Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FOOTER_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setFooter(preset)}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/50 transition text-left"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
