import { CalculationResult, ZakatHistory, Currency } from "@/types/zakat";

const STORAGE_KEY = "zakatinator-history";

function loadHistory(): ZakatHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { calculations: [], payments: [] } as ZakatHistory;
    const parsed = JSON.parse(raw) as ZakatHistory;
    if (!parsed.calculations) parsed.calculations = [];
    if (!parsed.payments) parsed.payments = [];
    return parsed;
  } catch {
    return { calculations: [], payments: [] } as ZakatHistory;
  }
}

function saveHistory(history: ZakatHistory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function ensureCalculationSaved(calc: CalculationResult) {
  const history = loadHistory();
  const exists = history.calculations.some((c) => c.id === calc.id);
  if (!exists) {
    history.calculations.push(calc);
    saveHistory(history);
  }
}

export function addPayment(params: {
  calculationId: string;
  amount: number;
  currency: Currency;
  paidDate?: string;
  notes?: string;
}) {
  const history = loadHistory();
  history.payments.push({
    id: `pay_${Date.now()}`,
    calculationId: params.calculationId,
    amount: params.amount,
    currency: params.currency,
    paidDate: params.paidDate ?? new Date().toISOString(),
    notes: params.notes ?? "",
  });
  saveHistory(history);
}

export function getHistory(): ZakatHistory {
  return loadHistory();
}
