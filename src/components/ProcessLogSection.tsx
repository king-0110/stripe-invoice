'use client';

import React, { useState } from 'react';
import {
  Activity,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Download,
  Trash2,
  Filter,
  Send,
  Loader2,
  Layers,
  AlertTriangle,
  Mail,
  Receipt
} from 'lucide-react';
import { DispatchResult, DispatchLogEvent } from '@/types/invoice';

interface ProcessLogSectionProps {
  dispatching: boolean;
  results: DispatchResult[];
  logs: DispatchLogEvent[];
  progress: number;
  totalCustomers: number;
  onClearLogs: () => void;
}

export default function ProcessLogSection({
  dispatching,
  results,
  logs,
  progress,
  totalCustomers,
  onClearLogs,
}: ProcessLogSectionProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'terminal'>('status');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;
  const processingCount = results.filter((r) => r.status === 'processing').length;
  const pendingCount = results.filter((r) => r.status === 'pending').length;

  const filteredResults = results.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const hasActivity = results.length > 0 || logs.length > 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header with live status & tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
            {dispatching && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                Live Dispatch & Process Monitor
              </h2>
              {dispatching ? (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-mono animate-pulse flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> RUNNING
                </span>
              ) : hasActivity ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  COMPLETED
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                  IDLE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Real-time invoice generation pipeline, email dispatch telemetry, and execution logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'status'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Recipient Status ({results.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeTab === 'terminal'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              System Logs ({logs.length})
            </button>
          </div>

          {hasActivity && (
            <button
              onClick={onClearLogs}
              disabled={dispatching}
              className="text-xs text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-500/10 border border-slate-800 p-2 rounded-xl transition disabled:opacity-40"
              title="Clear logs & monitor"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Big Live Sent / Total Counter */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${dispatching ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
            <Send className={`w-6 h-6 ${dispatching ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Invoices Dispatched
            </span>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold font-mono text-emerald-400 leading-none tabular-nums">
                {successCount}
              </span>
              <span className="text-2xl font-bold font-mono text-slate-500 leading-none">/</span>
              <span className="text-2xl font-bold font-mono text-slate-300 leading-none tabular-nums">
                {totalCustomers}
              </span>
              <span className="text-xs text-slate-500 ml-1.5 mb-0.5">emails uploaded</span>
            </div>
          </div>
        </div>

        {/* Live processed count & remaining */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Processed</span>
            <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
              {successCount + errorCount}
              <span className="text-slate-500 text-sm"> / {totalCustomers}</span>
            </span>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Remaining</span>
            <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              {pendingCount + processingCount}
            </span>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Success Rate</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {successCount + errorCount > 0
                ? `${Math.round((successCount / (successCount + errorCount)) * 100)}%`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat KPI Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Recipient Queue</span>
            <Mail className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">
            {totalCustomers} <span className="text-xs text-slate-500 font-normal">emails</span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-emerald-400">
            <span>Successfully Dispatched</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {successCount}{' '}
            <span className="text-xs text-emerald-500/80 font-normal">
              {totalCustomers > 0 ? `(${Math.round((successCount / totalCustomers) * 100)}%)` : ''}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-rose-400">
            <span>Failed / Errors</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {errorCount}{' '}
            <span className="text-xs text-rose-500/80 font-normal">
              {totalCustomers > 0 ? `(${Math.round((errorCount / totalCustomers) * 100)}%)` : ''}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-amber-400">
            <span>Pending / Processing</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {processingCount + pendingCount}{' '}
            <span className="text-xs text-amber-500/80 font-normal">remaining</span>
          </div>
        </div>
      </div>

      {/* Progress Bar (Visible when dispatching or when results exist) */}
      {(dispatching || results.length > 0) && (
        <div className="space-y-1.5 bg-slate-950/90 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-slate-300 flex items-center gap-2">
              {dispatching && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
              {dispatching ? 'Dispatch Pipeline in Progress...' : 'Batch Dispatch Completed'}
            </span>
            <span className="font-mono text-cyan-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                errorCount > 0 && successCount === 0
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* TAB 1: Recipient Status Grid */}
      {activeTab === 'status' && (
        <div className="space-y-3">
          {/* Filter badges */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400">Filter:</span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                  filterStatus === 'all'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({results.length})
              </button>
              <button
                onClick={() => setFilterStatus('success')}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                  filterStatus === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Sent ({successCount})
              </button>
              <button
                onClick={() => setFilterStatus('error')}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                  filterStatus === 'error'
                    ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                    : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                Failed ({errorCount})
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Showing {filteredResults.length} records
            </span>
          </div>

          {/* Results rows */}
          {results.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2">
              <Mail className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No active or previous invoice dispatches recorded.</p>
              <p className="text-[11px] text-slate-500">
                Click &quot;Dispatch Invoices&quot; in the summary section to begin processing.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredResults.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition text-xs space-y-2 ${
                    item.status === 'success'
                      ? 'bg-slate-950/90 border-emerald-500/30 hover:border-emerald-500/50'
                      : item.status === 'error'
                      ? 'bg-slate-950/90 border-rose-500/30 hover:border-rose-500/50'
                      : item.status === 'processing'
                      ? 'bg-slate-950/90 border-cyan-500/30 animate-pulse'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {item.status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {item.status === 'error' && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      {item.status === 'processing' && (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      )}
                      {item.status === 'pending' && (
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      )}

                      <div>
                        <span className="font-mono text-slate-200 font-semibold">
                          {item.email}
                        </span>
                        {item.name && (
                          <span className="text-slate-400 ml-2 font-normal">
                            ({item.name})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      {item.status === 'success' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          Invoice Sent
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                          Failed
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                          Finalizing...
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          In Queue
                        </span>
                      )}

                      {item.durationMs && (
                        <span className="text-slate-500 text-[10px]">
                          {item.durationMs}ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Success Invoice Meta details */}
                  {item.status === 'success' && (
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                      {item.invoiceNumber && (
                        <div>
                          Invoice No:{' '}
                          <span className="text-slate-200 font-mono font-medium">
                            #{item.invoiceNumber}
                          </span>
                        </div>
                      )}

                      {item.total !== undefined && (
                        <div>
                          Total:{' '}
                          <span className="text-amber-400 font-mono font-semibold">
                            ${item.total.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {item.hostedInvoiceUrl && (
                        <a
                          href={item.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
                        >
                          View Stripe Hosted Invoice <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {item.invoicePdf && (
                        <a
                          href={item.invoicePdf}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-300 hover:text-white flex items-center gap-1 transition"
                        >
                          Download PDF <Download className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Error Message Display */}
                  {item.status === 'error' && (
                    <div className="pt-1 text-[11px] text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
                      <span className="font-semibold text-rose-200">Stripe API Error:</span> {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: System Telemetry Terminal Logs */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-900 pb-2">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Stripe Invoice Dispatcher Telemetry Console
            </span>
            <span>{logs.length} Events</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-slate-600 py-6 text-center text-xs">
                Terminal idle. Ready to capture batch dispatch lifecycle events.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 select-none text-[10px] shrink-0 pt-0.5">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={`font-semibold shrink-0 ${
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'error'
                        ? 'text-rose-400'
                        : log.type === 'warning'
                        ? 'text-amber-400'
                        : log.type === 'start'
                        ? 'text-cyan-400'
                        : log.type === 'complete'
                        ? 'text-violet-400'
                        : 'text-indigo-400'
                    }`}
                  >
                    [{log.type.toUpperCase()}]
                  </span>
                  <span className="text-slate-300 break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
