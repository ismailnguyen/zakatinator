import { ZakatSettings, InventoryItem, DeductionItem, ExchangeRates, MetalPrices, Currency } from "@/types/zakat";
import { fetchLatestExchangeRates, fetchLatestMetalPrices } from "@/lib/market-data";

const SETTINGS_KEY = "zakatinator-settings";
const INVENTORY_KEY = "zakatinator-inventory";
const DEDUCTIONS_KEY = "zakatinator-deductions";
const EXCHANGE_RATES_KEY = "zakatinator-exchange-rates";
const METAL_PRICES_KEY = "zakatinator-metal-prices";
const EXCHANGE_RATES_META_KEY = "zakatinator-exchange-rates-meta";
const METAL_PRICES_META_KEY = "zakatinator-metal-prices-meta";

const EXCHANGE_RATES_TTL_MS = 1000 * 60 * 60; // 1 hour
const METAL_PRICES_TTL_MS = 1000 * 60 * 30; // 30 minutes

interface ExchangeRatesMeta {
  base: Currency;
  lastUpdated: string;
}

interface MetalPricesMeta {
  base: Currency;
}

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
  highContrast: false,
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

export function getSettings(): ZakatSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as ZakatSettings) : null;
  } catch {
    return null;
  }
}

export function getDefaultSettings(): ZakatSettings {
  return defaultSettings;
}

export function setSettings(s: ZakatSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  applyTheme(s.highContrast || false);
}

export function applyTheme(highContrast: boolean) {
  if (typeof document === 'undefined') return;
  if (highContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}

const getEffectiveBaseCurrency = (): Currency => {
  const settings = getSettings() || defaultSettings;
  return settings.baseCurrency;
};

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

const getExchangeRatesMeta = (): ExchangeRatesMeta | null => {
  try {
    const raw = localStorage.getItem(EXCHANGE_RATES_META_KEY);
    return raw ? (JSON.parse(raw) as ExchangeRatesMeta) : null;
  } catch {
    return null;
  }
};

const setExchangeRatesMeta = (meta: ExchangeRatesMeta) => {
  localStorage.setItem(EXCHANGE_RATES_META_KEY, JSON.stringify(meta));
};

export function getExchangeRatesLastUpdated(baseCurrency?: Currency): string | null {
  const meta = getExchangeRatesMeta();
  if (!meta) return null;
  const targetBase = baseCurrency ?? getEffectiveBaseCurrency();
  return meta.base === targetBase ? meta.lastUpdated : null;
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

const getMetalPricesMeta = (): MetalPricesMeta | null => {
  try {
    const raw = localStorage.getItem(METAL_PRICES_META_KEY);
    return raw ? (JSON.parse(raw) as MetalPricesMeta) : null;
  } catch {
    return null;
  }
};

const setMetalPricesMeta = (meta: MetalPricesMeta | null) => {
  if (meta) {
    localStorage.setItem(METAL_PRICES_META_KEY, JSON.stringify(meta));
  } else {
    localStorage.removeItem(METAL_PRICES_META_KEY);
  }
};

export function getMetalPricesLastUpdated(baseCurrency?: Currency): string | null {
  const meta = getMetalPricesMeta();
  if (!meta) return null;
  const targetBase = baseCurrency ?? getEffectiveBaseCurrency();
  return meta.base === targetBase ? getMetalPrices().lastUpdated : null;
}

export async function refreshExchangeRates(
  options: { force?: boolean; baseCurrency?: Currency } = {}
): Promise<ExchangeRates> {
  const baseCurrency = options.baseCurrency ?? getEffectiveBaseCurrency();
  const force = options.force ?? false;
  const meta = getExchangeRatesMeta();

  if (!force && meta && meta.base === baseCurrency) {
    const age = Date.now() - new Date(meta.lastUpdated).getTime();
    if (age < EXCHANGE_RATES_TTL_MS) {
      return getExchangeRates();
    }
  }

  const latest = await fetchLatestExchangeRates(baseCurrency);
  setExchangeRates(latest);
  setExchangeRatesMeta({ base: baseCurrency, lastUpdated: new Date().toISOString() });
  return latest;
}

export async function refreshMetalPrices(
  options: { force?: boolean; baseCurrency?: Currency } = {}
): Promise<MetalPrices> {
  const baseCurrency = options.baseCurrency ?? getEffectiveBaseCurrency();
  const force = options.force ?? false;
  const current = getMetalPrices();
  const meta = getMetalPricesMeta();

  if (!force && current?.lastUpdated && meta?.base === baseCurrency) {
    const age = Date.now() - new Date(current.lastUpdated).getTime();
    if (age < METAL_PRICES_TTL_MS) {
      return current;
    }
  }

  const exchangeRates = await refreshExchangeRates({ baseCurrency, force });
  const latest = await fetchLatestMetalPrices(baseCurrency, exchangeRates);
  setMetalPrices(latest);
  setMetalPricesMeta({ base: baseCurrency });
  return latest;
}
