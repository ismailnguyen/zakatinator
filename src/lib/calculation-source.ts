import { CalculationResult } from "@/types/zakat";
import { ZakatCalculator } from "@/lib/zakat-calculator";
import { getSettings, getInventory, getDeductions, getExchangeRates, getMetalPrices } from "@/lib/store";
import { ensureCalculationSaved } from "@/lib/history";

export function getCurrentCalculationSnapshot(): Omit<CalculationResult, 'id' | 'timestamp'> {
  const settings = getSettings();
  const inventory = getInventory();
  const deductions = getDeductions();
  const exchangeRates = getExchangeRates();
  const metalPrices = getMetalPrices();

  return ZakatCalculator.calculate(inventory, deductions, settings, exchangeRates, metalPrices);
}

export function saveCurrentCalculation(): CalculationResult {
  const snapshot = getCurrentCalculationSnapshot();
  const calc: CalculationResult = {
    id: `calc_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...snapshot,
  };
  ensureCalculationSaved(calc);
  return calc;
}

