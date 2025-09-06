import { ZakatSettings, InventoryItem, DeductionItem, ExchangeRates, MetalPrices } from "@/types/zakat";

const SETTINGS_KEY = "zakatinator-settings";
const INVENTORY_KEY = "zakatinator-inventory";
const DEDUCTIONS_KEY = "zakatinator-deductions";
const EXCHANGE_RATES_KEY = "zakatinator-exchange-rates";
const METAL_PRICES_KEY = "zakatinator-metal-prices";

// Defaults: safe, simple values to avoid crashes
const defaultSettings: ZakatSettings = {
  baseCurrency: 'EUR',
  calendar: 'HIJRI',
  anchorDate: { gregorian: new Date().toISOString().split('T')[0] },
  nisabMode: 'GOLD',
  fiqh: {
    includeMinorsCash: true,
    jewelryPolicy: 'INCLUDE_METAL',
    includePersonalGoldContent: false,
  },
  rounding: 2,
};

const defaultExchangeRates: ExchangeRates = {
  'USD_EUR': 0.92,
  'GBP_EUR': 1.17,
  'CHF_EUR': 1.06,
  'CAD_EUR': 0.68,
  'AUD_EUR': 0.62,
  'SAR_EUR': 0.25,
  'AED_EUR': 0.26,
  'QAR_EUR': 0.26,
};

const defaultMetalPrices: MetalPrices = {
  goldPerGram: 60,
  silverPerGram: 0.7,
  lastUpdated: new Date().toISOString(),
};

export function getSettings(): ZakatSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as ZakatSettings) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function setSettings(s: ZakatSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function getInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    return raw ? (JSON.parse(raw) as InventoryItem[]) : [];
  } catch {
    return [];
  }
}

export function setInventory(items: InventoryItem[]) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

export function getDeductions(): DeductionItem[] {
  try {
    const raw = localStorage.getItem(DEDUCTIONS_KEY);
    return raw ? (JSON.parse(raw) as DeductionItem[]) : [];
  } catch {
    return [];
  }
}

export function setDeductions(items: DeductionItem[]) {
  localStorage.setItem(DEDUCTIONS_KEY, JSON.stringify(items));
}

export function getExchangeRates(): ExchangeRates {
  try {
    const raw = localStorage.getItem(EXCHANGE_RATES_KEY);
    return raw ? (JSON.parse(raw) as ExchangeRates) : defaultExchangeRates;
  } catch {
    return defaultExchangeRates;
  }
}

export function setExchangeRates(r: ExchangeRates) {
  localStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify(r));
}

export function getMetalPrices(): MetalPrices {
  try {
    const raw = localStorage.getItem(METAL_PRICES_KEY);
    return raw ? (JSON.parse(raw) as MetalPrices) : defaultMetalPrices;
  } catch {
    return defaultMetalPrices;
  }
}

export function setMetalPrices(m: MetalPrices) {
  localStorage.setItem(METAL_PRICES_KEY, JSON.stringify(m));
}

