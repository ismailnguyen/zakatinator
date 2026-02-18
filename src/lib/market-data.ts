import { Currency, ExchangeRates, MetalPrices } from "@/types/zakat";

const FX_API_BASE = "https://open.er-api.com/v6/latest";
const METAL_API_BASE = "/api/gold-price";
const TROY_OUNCE_IN_GRAMS = 31.1034768;

interface ExchangeApiResponse {
  result: "success" | "error";
  base_code: string;
  rates: Record<string, number>;
}

interface MetalApiResponse {
  items?: Array<{
    curr: string;
    xauPrice?: string | number;
    xagPrice?: string | number;
  }>;
}

const parseNumber = (value: string | number | undefined | null): number | null => {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const ensureFxRate = (
  exchangeRates: ExchangeRates | undefined,
  from: string,
  to: string
): number | null => {
  if (!exchangeRates) return null;
  const directKey = `${from}_${to}`;
  if (exchangeRates[directKey] != null) return exchangeRates[directKey];
  const inverseKey = `${to}_${from}`;
  if (exchangeRates[inverseKey] != null && exchangeRates[inverseKey] !== 0) {
    return 1 / exchangeRates[inverseKey];
  }
  return null;
};

export async function fetchLatestExchangeRates(baseCurrency: Currency): Promise<ExchangeRates> {
  if (typeof fetch === "undefined") {
    throw new Error("fetch API is not available in this environment");
  }

  const response = await fetch(`${FX_API_BASE}/${baseCurrency}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates (status ${response.status})`);
  }

  const data = (await response.json()) as ExchangeApiResponse;
  if (data.result !== "success" || !data.rates) {
    throw new Error("Exchange rate API returned an error response");
  }

  const effectiveBase = data.base_code as Currency;
  const rates: ExchangeRates = {};

  Object.entries(data.rates).forEach(([code, rate]) => {
    if (!Number.isFinite(rate) || rate === 0) return;
    const upperCode = code.toUpperCase();
    rates[`${effectiveBase}_${upperCode}`] = rate;
    rates[`${upperCode}_${effectiveBase}`] = 1 / rate;
  });

  rates[`${effectiveBase}_${effectiveBase}`] = 1;

  if (effectiveBase !== baseCurrency) {
    const rateAToB = rates[`${effectiveBase}_${baseCurrency}`];
    if (rateAToB && rateAToB !== 0) {
      Object.entries(data.rates).forEach(([code, rateAToCode]) => {
        if (!Number.isFinite(rateAToCode) || rateAToCode === 0) return;
        const upperCode = code.toUpperCase();
        const rateBToCode = rateAToCode / rateAToB;
        if (Number.isFinite(rateBToCode) && rateBToCode !== 0) {
          rates[`${baseCurrency}_${upperCode}`] = rateBToCode;
          rates[`${upperCode}_${baseCurrency}`] = 1 / rateBToCode;
        }
      });
      rates[`${baseCurrency}_${baseCurrency}`] = 1;
    }
  }

  return rates;
}

export async function fetchLatestMetalPrices(
  baseCurrency: Currency,
  exchangeRates?: ExchangeRates
): Promise<MetalPrices> {
  if (typeof fetch === "undefined") {
    throw new Error("fetch API is not available in this environment");
  }

  const attemptFetch = async (currency: string): Promise<MetalApiResponse | null> => {
    try {
      const response = await fetch(`${METAL_API_BASE}/${currency}`);
      if (!response.ok) return null;
      return (await response.json()) as MetalApiResponse;
    } catch (error) {
      console.error("Failed to fetch metal prices", error);
      return null;
    }
  };

  let sourceCurrency: string = baseCurrency;
  let data = await attemptFetch(sourceCurrency);

  if (!data?.items?.length) {
    sourceCurrency = "USD";
    data = await attemptFetch(sourceCurrency);
  }

  if (!data?.items?.length) {
    throw new Error("Unable to retrieve metal prices from public API");
  }

  const record = data.items[0];
  const goldPerOunce = parseNumber(record.xauPrice);
  const silverPerOunce = parseNumber(record.xagPrice);

  if (goldPerOunce == null || silverPerOunce == null) {
    throw new Error("Metal price response missing values");
  }

  let goldPerGram = goldPerOunce / TROY_OUNCE_IN_GRAMS;
  let silverPerGram = silverPerOunce / TROY_OUNCE_IN_GRAMS;

  if (sourceCurrency !== baseCurrency) {
    const rate = ensureFxRate(exchangeRates, sourceCurrency, baseCurrency);
    if (rate == null) {
      throw new Error(`Missing FX rate to convert metal prices from ${sourceCurrency} to ${baseCurrency}`);
    }
    goldPerGram *= rate;
    silverPerGram *= rate;
  }

  return {
    goldPerGram,
    silverPerGram,
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchCryptoPrice(tokenSymbol: string, currency: string): Promise<number | null> {
  if (!tokenSymbol) return null;
  const symbol = tokenSymbol.toUpperCase();
  const curr = currency.toUpperCase();

  // Try direct pair first (e.g. BTCEUR)
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}${curr}`);
    if (response.ok) {
      const data = await response.json();
      return parseFloat(data.price);
    }
  } catch (e) {
    console.warn(`Failed to fetch direct pair ${symbol}${curr}`, e);
  }

  // Fallback: Try USDT pair (e.g. BTCUSDT) and we might need conversion if we had rates, 
  // but for now let's just try to return the price if the user is okay with USD/USDT or if we can't find the specific currency.
  // Actually, if direct pair fails, it might be better to return null or try USDT and let the UI handle conversion if it had access to rates.
  // Given the current architecture, let's try USDT as a fallback only if the target currency is USD-like.
  if (curr === 'USD') {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
      if (response.ok) {
        const data = await response.json();
        return parseFloat(data.price);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return null;
}
