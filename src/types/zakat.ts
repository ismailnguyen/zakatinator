export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD' | 'AUD' | 'SAR' | 'AED' | 'QAR';

export type CalendarSystem = 'HIJRI' | 'GREGORIAN';

export type NisabMode = 'GOLD' | 'SILVER' | 'MANUAL';

export type AssetType =
  | 'CASH'
  | 'CASH_MINOR'
  | 'ASSURANCE_VIE'
  | 'ASSURANCE_VIE'
  | 'STOCKS'
  | 'CRYPTO'
  | 'CRYPTO'
  | 'FX_CASH'
  | 'GOLD'
  | 'SILVER'
  | 'JEWELRY'
  | 'WATCH'
  | 'LOAN_RECEIVABLE'
  | 'TRADE_STOCK'
  | 'OTHER';

export type Ownership = 'SELF' | 'MINOR' | 'SPOUSE' | 'JOINT';

export type JewelryPolicy = 'INCLUDE_METAL' | 'EXCLUDE_PERSONAL';

export type LoanStrength = 'STRONG' | 'WEAK';

export interface ZakatSettings {
  baseCurrency: Currency;
  calendar: CalendarSystem;
  anchorDate: {
    hijri?: string;
    gregorian: string;
  };
  nisabMode: NisabMode;
  nisabManualAmount?: number;
  fiqh: {
    includeMinorsCash: boolean;
    jewelryPolicy: JewelryPolicy;
    includePersonalGoldContent: boolean;
  };
  rounding: number;
  highContrast?: boolean;
}

export interface InventoryItem {
  id: string;
  label: string;
  type: AssetType;
  ownership: Ownership;
  location?: string; // Bank name, wallet, physical location, etc.

  // Currency-based items
  currency?: Currency;
  amount?: number;

  // Precious metals
  metal?: 'GOLD' | 'SILVER';
  weightG?: number;
  purity?: number; // e.g., 0.999 for 99.9%

  // Crypto
  token?: string;
  quantity?: number;
  pricePerToken?: number;

  // Loans
  loanStrength?: LoanStrength;

  // Overrides
  includeOverride?: boolean;
  archived: boolean;
  notes: string;

  createdAt: string;
  updatedAt: string;
}

export interface DeductionItem {
  id: string;
  label: string;
  currency: Currency;
  amount: number;
  dueDate?: string;
  notes: string;

  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRates {
  [key: string]: number; // Currency pair to base currency rate
}

export interface MetalPrices {
  goldPerGram: number; // In base currency
  silverPerGram: number; // In base currency
  lastUpdated: string;
}

export interface CalculationResult {
  id: string;
  timestamp: string;
  dueDate: {
    hijri?: string;
    gregorian: string;
  };

  // Inputs (frozen at calculation time)
  settings: ZakatSettings;
  inventory: InventoryItem[];
  deductions: DeductionItem[];
  exchangeRates: ExchangeRates;
  metalPrices: MetalPrices;

  // Calculation breakdown
  grossAssets: number;
  deductionsTotal: number;
  netAssets: number;
  nisabValue: number;
  zakatDue: number;

  breakdown: {
    byType: Record<AssetType, number>;
    items: Array<{
      id: string;
      label: string;
      type: AssetType;
      originalValue: number;
      originalCurrency?: Currency;
      convertedValue: number;
      included: boolean;
      reason?: string;
    }>;
  };

  status: 'BELOW_NISAB' | 'DUE';
}

export interface ZakatHistory {
  calculations: CalculationResult[];
  payments: Array<{
    id: string;
    calculationId: string;
    amount: number;
    currency: Currency;
    paidDate: string;
    notes: string;
  }>;
}