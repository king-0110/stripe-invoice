'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  Unplug,
  Globe,
  Building2,
  Wallet,
  Check,
  Lock,
  ExternalLink,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface AccountInfo {
  id: string;
  businessName: string;
  email: string | null;
  country: string | null;
  defaultCurrency: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  keyType: 'secret' | 'restricted';
  livemode: boolean;
  balance?: {
    available: { amount: number; currency: string }[];
    pending: { amount: number; currency: string }[];
  } | null;
}

interface ApiKeySectionProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isValidated: boolean;
  setIsValidated: (valid: boolean) => void;
  accountInfo: AccountInfo | null;
  setAccountInfo: (info: AccountInfo | null) => void;
}

export default function ApiKeySection({
  apiKey,
  setApiKey,
  isValidated,
  setIsValidated,
  accountInfo,
  setAccountInfo,
}: ApiKeySectionProps) {
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberKey, setRememberKey] = useState(true);
  const [keyHint, setKeyHint] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setKeyHint(null);
    } else if (trimmed.startsWith('sk_test_')) {
      setKeyHint('Secret Key (Test Mode)');
    } else if (trimmed.startsWith('sk_live_')) {
      setKeyHint('Secret Key (Live Mode)');
    } else if (trimmed.startsWith('rk_test_')) {
      setKeyHint('Restricted Key (Test Mode)');
    } else if (trimmed.startsWith('rk_live_')) {
      setKeyHint('Restricted Key (Live Mode)');
    } else if (trimmed.startsWith('pk_')) {
      setKeyHint('Publishable Key (Invalid for invoicing)');
    } else {
      setKeyHint('Unrecognized key prefix');
    }
  }, [apiKey]);

  const handleValidate = async (keyToValidate?: string) => {
    const key = (keyToValidate || apiKey).trim();
    if (!key) {
      setError('Please enter your Stripe secret or restricted key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });

      const data = await res.json();

      if (data.valid) {
        setIsValidated(true);
        setAccountInfo(data.account);
        if (rememberKey) {
          localStorage.setItem('stripe_api_key', key);
        } else {
          localStorage.removeItem('stripe_api_key');
        }
      } else {
        setIsValidated(false);
        setAccountInfo(null);
        setError(data.error || 'Failed to authenticate key with Stripe.');
      }
    } catch {
      setIsValidated(false);
      setAccountInfo(null);
      setError('Network connection error while testing Stripe key.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setApiKey('');
    setIsValidated(false);
    setAccountInfo(null);
    setError(null);
    localStorage.removeItem('stripe_api_key');
  };

  // Mask key for display
  const maskedKey = apiKey
    ? `${apiKey.slice(0, 7)}••••••••••••••••${apiKey.slice(-4)}`
    : '';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Key className="w-5 h-5" />
            </div>
            {isValidated && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                <Check className="w-2 h-2 text-white stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">Section 1: API Integration</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Stripe Key Engine
              </span>
              {isValidated && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    accountInfo?.livemode
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {accountInfo?.livemode ? '● Live Mode' : '● Test Mode'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Authenticate your Stripe API key with live account validation and balance analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isValidated && (
            <button
              onClick={() => handleValidate()}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800/70 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition border border-slate-700/60 flex items-center gap-1.5"
              title="Refresh Account Data"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          {isValidated && (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition border border-rose-500/20"
            >
              <Unplug className="w-3.5 h-3.5" />
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Stripe Secret / Restricted Key
            </label>
            {keyHint && (
              <span
                className={`font-mono text-[11px] ${
                  keyHint.includes('Invalid') || keyHint.includes('Unrecognized')
                    ? 'text-rose-400'
                    : keyHint.includes('Live')
                    ? 'text-amber-400'
                    : 'text-indigo-400'
                }`}
              >
                {keyHint}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (isValidated) setIsValidated(false);
              }}
              placeholder="sk_test_... or sk_live_... / rk_..."
              className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition font-mono pr-28"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-2 text-slate-400 hover:text-slate-200 transition"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => handleValidate()}
                disabled={loading || !apiKey.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                {isValidated ? 'Re-test' : 'Connect'}
              </button>
            </div>
          </div>
        </div>

        {/* Storage checkbox */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => {
                setRememberKey(e.target.checked);
                if (!e.target.checked) {
                  localStorage.removeItem('stripe_api_key');
                } else if (isValidated && apiKey) {
                  localStorage.setItem('stripe_api_key', apiKey);
                }
              }}
              className="accent-indigo-500 rounded cursor-pointer"
            />
            <span>Remember API key in browser storage</span>
          </label>

          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline text-[11px]"
          >
            Get Stripe API Key <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-rose-200">Validation Error:</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Advanced Connected Account Panel */}
        {isValidated && accountInfo && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Business Name */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Account</span>
                </div>
                <div className="font-semibold text-slate-100 text-sm truncate" title={accountInfo.businessName}>
                  {accountInfo.businessName}
                </div>
                <div className="font-mono text-[10px] text-slate-500 truncate">{accountInfo.id}</div>
              </div>

              {/* Country & Currency */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Region & Currency</span>
                </div>
                <div className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                  <span className="uppercase">{accountInfo.country || 'Global'}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-sky-400 font-mono">{accountInfo.defaultCurrency}</span>
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Currency Supported
                </div>
              </div>

              {/* Charges & Payouts Status */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Account Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${accountInfo.chargesEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {accountInfo.chargesEnabled ? 'Charges Enabled' : 'Restricted'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Payouts: {accountInfo.payoutsEnabled ? 'Active' : 'Disabled'}
                </div>
              </div>

              {/* Live Available Balance */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Available Balance</span>
                </div>
                <div className="font-semibold font-mono text-slate-100 text-sm">
                  {accountInfo.balance?.available?.[0]
                    ? `${accountInfo.balance.available[0].amount.toFixed(2)} ${accountInfo.balance.available[0].currency.toUpperCase()}`
                    : 'Available'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {accountInfo.balance?.pending?.[0]
                    ? `Pending: ${accountInfo.balance.pending[0].amount.toFixed(2)} ${accountInfo.balance.pending[0].currency.toUpperCase()}`
                    : 'Auto-synced'}
                </div>
              </div>
            </div>

            {/* Verification Footer Bar */}
            <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3.5 py-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Connected to <strong className="text-emerald-300">{accountInfo.businessName}</strong> ({accountInfo.id})
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-300/80 uppercase">
                Invoice API Ready
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
