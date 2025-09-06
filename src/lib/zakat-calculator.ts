import { 
  InventoryItem, 
  DeductionItem, 
  ZakatSettings, 
  ExchangeRates, 
  MetalPrices, 
  CalculationResult,
  Currency,
  AssetType
} from "@/types/zakat";

export class ZakatCalculator {
  
  /**
   * Convert amount from source currency to base currency
   */
  static convertToBase(
    amount: number, 
    fromCurrency: Currency, 
    baseCurrency: Currency,
    exchangeRates: ExchangeRates
  ): number {
    if (fromCurrency === baseCurrency) return amount;
    
    const rate = exchangeRates[`${fromCurrency}_${baseCurrency}`];
    if (!rate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${baseCurrency}`);
    }
    
    return amount * rate;
  }

  /**
   * Calculate value of precious metal in base currency
   */
  static calculateMetalValue(
    weightG: number,
    purity: number,
    pricePerG: number
  ): number {
    return weightG * purity * pricePerG;
  }

  /**
   * Calculate nisab value based on settings
   */
  static calculateNisab(
    settings: ZakatSettings,
    metalPrices: MetalPrices
  ): number {
    switch (settings.nisabMode) {
      case 'GOLD':
        return 85 * metalPrices.goldPerGram;
      case 'SILVER':
        return 595 * metalPrices.silverPerGram;
      case 'MANUAL':
        return settings.nisabManualAmount || 0;
      default:
        throw new Error('Invalid nisab mode');
    }
  }

  /**
   * Determine if an inventory item should be included in zakat calculation
   */
  static shouldIncludeItem(
    item: InventoryItem,
    settings: ZakatSettings
  ): { included: boolean; reason?: string } {
    // Manual override takes precedence
    if (item.includeOverride !== null && item.includeOverride !== undefined) {
      return { 
        included: item.includeOverride,
        reason: item.includeOverride ? 'Manual inclusion' : 'Manual exclusion'
      };
    }

    // Archived items are excluded
    if (item.archived) {
      return { included: false, reason: 'Archived item' };
    }

    // Apply fiqh rules based on type
    switch (item.type) {
      case 'CASH_MINOR':
        return {
          included: settings.fiqh.includeMinorsCash,
          reason: settings.fiqh.includeMinorsCash 
            ? "Minor's cash included per settings" 
            : "Minor's cash excluded per settings"
        };

      case 'JEWELRY':
        if (item.metal === 'GOLD' || item.metal === 'SILVER') {
          return {
            included: settings.fiqh.jewelryPolicy === 'INCLUDE_METAL',
            reason: settings.fiqh.jewelryPolicy === 'INCLUDE_METAL'
              ? 'Jewelry metal value included per fiqh setting'
              : 'Personal jewelry excluded per fiqh setting'
          };
        }
        return { included: false, reason: 'Non-precious metal jewelry excluded' };

      case 'WATCH':
        if (item.metal === 'GOLD' || item.metal === 'SILVER') {
          return {
            included: settings.fiqh.includePersonalGoldContent,
            reason: settings.fiqh.includePersonalGoldContent
              ? 'Personal gold/silver content included per setting'
              : 'Personal gold/silver content excluded per setting'
          };
        }
        return { included: false, reason: 'Non-precious metal watch excluded' };

      case 'LOAN_RECEIVABLE':
        return {
          included: item.loanStrength === 'STRONG',
          reason: item.loanStrength === 'STRONG' 
            ? 'Strong loan included'
            : 'Weak/uncertain loan excluded'
        };

      // Most asset types are included by default
      case 'CASH':
      case 'ASSURANCE_VIE':
      case 'PEA':
      case 'CRYPTO':
      case 'FX_CASH':
      case 'GOLD':
      case 'SILVER':
      case 'TRADE_STOCK':
      case 'OTHER':
        return { included: true, reason: 'Standard zakatable asset' };

      default:
        return { included: false, reason: 'Unknown asset type' };
    }
  }

  /**
   * Calculate the value of an inventory item in base currency
   */
  static calculateItemValue(
    item: InventoryItem,
    settings: ZakatSettings,
    exchangeRates: ExchangeRates,
    metalPrices: MetalPrices
  ): number {
    switch (item.type) {
      case 'CASH':
      case 'CASH_MINOR':
      case 'ASSURANCE_VIE':
      case 'PEA':
      case 'FX_CASH':
      case 'TRADE_STOCK':
      case 'OTHER':
        if (!item.currency || item.amount === undefined) return 0;
        return this.convertToBase(
          item.amount,
          item.currency,
          settings.baseCurrency,
          exchangeRates
        );

      case 'CRYPTO':
        if (item.amount !== undefined && item.currency) {
          // Direct value entry
          return this.convertToBase(
            item.amount,
            item.currency,
            settings.baseCurrency,
            exchangeRates
          );
        } else if (item.quantity && item.pricePerToken && item.currency) {
          // Quantity × price approach
          const totalValue = item.quantity * item.pricePerToken;
          return this.convertToBase(
            totalValue,
            item.currency,
            settings.baseCurrency,
            exchangeRates
          );
        }
        return 0;

      case 'GOLD':
      case 'SILVER':
      case 'JEWELRY':
      case 'WATCH':
        if (item.weightG && item.purity && item.metal) {
          const pricePerG = item.metal === 'GOLD' 
            ? metalPrices.goldPerGram 
            : metalPrices.silverPerGram;
          return this.calculateMetalValue(item.weightG, item.purity, pricePerG);
        } else if (item.amount && item.currency) {
          // Fallback to estimated value
          return this.convertToBase(
            item.amount,
            item.currency,
            settings.baseCurrency,
            exchangeRates
          );
        }
        return 0;

      case 'LOAN_RECEIVABLE':
        if (!item.currency || item.amount === undefined) return 0;
        return this.convertToBase(
          item.amount,
          item.currency,
          settings.baseCurrency,
          exchangeRates
        );

      default:
        return 0;
    }
  }

  /**
   * Calculate total deductions in base currency
   */
  static calculateDeductions(
    deductions: DeductionItem[],
    baseCurrency: Currency,
    exchangeRates: ExchangeRates
  ): number {
    return deductions.reduce((total, deduction) => {
      const convertedAmount = this.convertToBase(
        deduction.amount,
        deduction.currency,
        baseCurrency,
        exchangeRates
      );
      return total + convertedAmount;
    }, 0);
  }

  /**
   * Calculate next due date based on calendar system and anchor
   */
  static calculateNextDueDate(
    anchorDate: string,
    calendar: 'HIJRI' | 'GREGORIAN',
    today: Date = new Date()
  ): { hijri?: string; gregorian: string; daysRemaining: number } {
    const anchor = new Date(anchorDate);
    let nextDue: Date;

    if (calendar === 'GREGORIAN') {
      // Add one year to anchor date
      nextDue = new Date(anchor);
      nextDue.setFullYear(today.getFullYear());
      
      // If this year's date has passed, move to next year
      if (nextDue <= today) {
        nextDue.setFullYear(today.getFullYear() + 1);
      }
    } else {
      // HIJRI - simplified calculation (lunar year ≈ 354 days)
      // In a real implementation, use a proper Hijri calendar library
      nextDue = new Date(anchor);
      const lunarYearMs = 354 * 24 * 60 * 60 * 1000;
      
      while (nextDue <= today) {
        nextDue = new Date(nextDue.getTime() + lunarYearMs);
      }
    }

    const daysRemaining = Math.ceil((nextDue.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    return {
      gregorian: nextDue.toISOString().split('T')[0],
      daysRemaining
    };
  }

  /**
   * Main calculation function
   */
  static calculate(
    inventory: InventoryItem[],
    deductions: DeductionItem[],
    settings: ZakatSettings,
    exchangeRates: ExchangeRates,
    metalPrices: MetalPrices
  ): Omit<CalculationResult, 'id' | 'timestamp'> {
    
    const itemBreakdown = inventory.map(item => {
      const inclusion = this.shouldIncludeItem(item, settings);
      const value = inclusion.included 
        ? this.calculateItemValue(item, settings, exchangeRates, metalPrices)
        : 0;

      return {
        id: item.id,
        label: item.label,
        type: item.type,
        originalValue: item.amount || 0,
        originalCurrency: item.currency,
        convertedValue: value,
        included: inclusion.included,
        reason: inclusion.reason
      };
    });

    const grossAssets = itemBreakdown
      .filter(item => item.included)
      .reduce((sum, item) => sum + item.convertedValue, 0);

    const deductionsTotal = this.calculateDeductions(
      deductions, 
      settings.baseCurrency, 
      exchangeRates
    );

    const netAssets = Math.max(0, grossAssets - deductionsTotal);
    const nisabValue = this.calculateNisab(settings, metalPrices);
    
    const zakatDue = netAssets >= nisabValue 
      ? Number((netAssets * 0.025).toFixed(settings.rounding))
      : 0;

    const byTypeBreakdown = itemBreakdown
      .filter(item => item.included)
      .reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.convertedValue;
        return acc;
      }, {} as Record<AssetType, number>);

    const nextDueDate = this.calculateNextDueDate(
      settings.anchorDate.gregorian,
      settings.calendar
    );

    return {
      dueDate: nextDueDate,
      settings,
      inventory,
      deductions,
      exchangeRates,
      metalPrices,
      grossAssets,
      deductionsTotal,
      netAssets,
      nisabValue,
      zakatDue,
      breakdown: {
        byType: byTypeBreakdown,
        items: itemBreakdown
      },
      status: zakatDue > 0 ? 'DUE' : 'BELOW_NISAB'
    };
  }
}