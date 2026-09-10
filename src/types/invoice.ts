export interface LineItem {
  id: string;
  description: string;
  unitAmount: number;
  quantity: number;
}

export interface CustomerInput {
  email: string;
  name?: string;
}

export interface DispatchSettings {
  memo: string;
  footer: string;
  currency: string;
  daysUntilDue: number;
  autoAdvance: boolean;
}

export interface DispatchResult {
  email: string;
  name?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  invoiceId?: string;
  invoiceNumber?: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  total?: number;
  currency?: string;
  error?: string;
  timestamp?: string;
  durationMs?: number;
}

export interface DispatchLogEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'start' | 'complete';
  message: string;
  details?: string;
}
