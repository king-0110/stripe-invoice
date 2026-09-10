'use client';

import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

interface MemoSectionProps {
  memo: string;
  setMemo: (memo: string) => void;
}

const MEMO_PRESETS = [
  'Thank you for your business! Please pay within the due date.',
  'Monthly recurring subscription fee for services rendered.',
  'Project Milestone Completion Payment - Retainer & Consulting.',
  'Annual software license & support renewal invoice.',
];

export default function MemoSection({ memo, setMemo }: MemoSectionProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              Section 2: Invoice Memo
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-normal">
                Header Note
              </span>
            </h2>
            <p className="text-xs text-slate-400">Main note shown at the top/description of the Stripe invoice</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <textarea
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="e.g. Thanks for your business! Payment is due within 7 days."
          className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition resize-none"
        />

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Quick Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMemo(preset)}
                className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/50 transition text-left"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
