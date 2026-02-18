import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe, Scale, Shield, RefreshCw, Eye } from "lucide-react";
import { ZakatSettings, Currency, CalendarSystem, NisabMode } from "@/types/zakat";
import {
  getSettings as loadSettingsFromStore,
  setSettings as saveSettingsToStore,
  refreshExchangeRates,
  refreshMetalPrices,
  getExchangeRatesLastUpdated,
  getMetalPrices,
  getMetalPricesLastUpdated,
} from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

// Default settings
const defaultSettings: ZakatSettings = {
  baseCurrency: 'EUR',
  calendar: 'HIJRI',
  anchorDate: {
    gregorian: '2024-03-20'
  },
  nisabMode: 'GOLD',
  fiqh: {
    includeMinorsCash: true,
    jewelryPolicy: 'INCLUDE_METAL',
    includePersonalGoldContent: false
  },
  rounding: 2
};

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'SAR', label: 'Saudi Riyal', symbol: 'ر.س' },
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
  { value: 'QAR', label: 'Qatari Riyal', symbol: 'ر.ق' },
];

export function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ZakatSettings>(loadSettingsFromStore() || defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);
  const [isRefreshingMetals, setIsRefreshingMetals] = useState(false);
  const [exchangeRatesUpdatedAt, setExchangeRatesUpdatedAt] = useState<string | null>(() => getExchangeRatesLastUpdated(settings.baseCurrency));
  const [metalPricesUpdatedAt, setMetalPricesUpdatedAt] = useState<string | null>(() => getMetalPricesLastUpdated(settings.baseCurrency));
  const [metalPrices, setMetalPrices] = useState(() => getMetalPrices());
  const [manualNisabInput, setManualNisabInput] = useState(() =>
    settings.nisabManualAmount != null ? settings.nisabManualAmount.toString() : ''
  );

  const updateSetting = <K extends keyof ZakatSettings>(
    key: K,
    value: ZakatSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);

    if (key === 'baseCurrency') {
      const nextBase = value as Currency;
      setExchangeRatesUpdatedAt(getExchangeRatesLastUpdated(nextBase));
      setMetalPricesUpdatedAt(getMetalPricesLastUpdated(nextBase));
    }
  };

  useEffect(() => {
    setManualNisabInput(settings.nisabManualAmount != null ? settings.nisabManualAmount.toString() : '');
  }, [settings.nisabManualAmount]);

  useEffect(() => {
    let cancelled = false;

    const syncMarketData = async () => {
      setExchangeRatesUpdatedAt(getExchangeRatesLastUpdated(settings.baseCurrency));
      setMetalPrices(getMetalPrices());
      setMetalPricesUpdatedAt(getMetalPricesLastUpdated(settings.baseCurrency));

      try {
        await refreshExchangeRates({ baseCurrency: settings.baseCurrency, force: false });
        if (!cancelled) {
          setExchangeRatesUpdatedAt(getExchangeRatesLastUpdated(settings.baseCurrency));
        }
      } catch (error) {
        console.error('Failed to refresh exchange rates for nisab', error);
      }

      try {
        const latest = await refreshMetalPrices({ baseCurrency: settings.baseCurrency, force: false });
        if (!cancelled) {
          setMetalPrices(latest);
          setMetalPricesUpdatedAt(latest.lastUpdated);
        }
      } catch (error) {
        console.error('Failed to refresh metal prices for nisab', error);
      }
    };

    syncMarketData();

    return () => {
      cancelled = true;
    };
  }, [settings.baseCurrency]);

  const updateFiqhSetting = <K extends keyof ZakatSettings['fiqh']>(
    key: K,
    value: ZakatSettings['fiqh'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      fiqh: { ...prev.fiqh, [key]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    saveSettingsToStore(settings);
    setHasUnsavedChanges(false);
  };

  const clearAllData = () => {
    const keys = [
      'zakatinator-settings',
      'zakatinator-inventory',
      'zakatinator-deductions',
      'zakatinator-exchange-rates',
      'zakatinator-exchange-rates-meta',
      'zakatinator-metal-prices',
      'zakatinator-metal-prices-meta',
      'zakatinator-history',
    ];
    try {
      keys.forEach(k => localStorage.removeItem(k));
      setSettings(defaultSettings);
      setHasUnsavedChanges(false);
      setExchangeRatesUpdatedAt(null);
      setMetalPricesUpdatedAt(null);
      setMetalPrices(getMetalPrices());
      toast({ title: 'All data cleared', description: 'Your local settings, inventory, and history have been removed.' });
    } catch (e) {
      toast({ title: 'Failed to clear data', description: 'Please try again or clear site data from your browser.', });
    }
  };

  const handleManualNisabInputChange = (value: string) => {
    setManualNisabInput(value);

    if (value.trim() === '') {
      setSettings(prev => ({ ...prev, nisabManualAmount: undefined }));
      setHasUnsavedChanges(true);
      return;
    }

    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      setSettings(prev => ({ ...prev, nisabManualAmount: parsed }));
      setHasUnsavedChanges(true);
    }
  };

  const handleRefreshExchangeRates = async () => {
    setIsRefreshingRates(true);
    try {
      await refreshExchangeRates({ force: true, baseCurrency: settings.baseCurrency });
      const updatedAt = getExchangeRatesLastUpdated(settings.baseCurrency);
      setExchangeRatesUpdatedAt(updatedAt);
      toast({ title: 'Exchange rates updated', description: 'Latest currency conversion rates loaded from the market.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to update exchange rates', description: 'Please try again later or check your internet connection.', variant: 'destructive' });
    } finally {
      setIsRefreshingRates(false);
    }
  };

  const handleRefreshMetalPrices = async () => {
    setIsRefreshingMetals(true);
    try {
      const latest = await refreshMetalPrices({ force: true, baseCurrency: settings.baseCurrency });
      setMetalPrices(latest);
      setMetalPricesUpdatedAt(latest.lastUpdated);
      toast({ title: 'Metal prices updated', description: 'Gold and silver prices refreshed using the latest market data.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to update metal prices', description: 'Please try again later or check your internet connection.', variant: 'destructive' });
    } finally {
      setIsRefreshingMetals(false);
    }
  };

  const formatUpdatedAt = (iso: string | null) => {
    if (!iso) return 'No data yet';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.baseCurrency
    }).format(amount);
  };

  const goldNisab = useMemo(() => metalPrices.goldPerGram * 85, [metalPrices.goldPerGram]);
  const silverNisab = useMemo(() => metalPrices.silverPerGram * 595, [metalPrices.silverPerGram]);
  const manualNisab = settings.nisabManualAmount ?? NaN;

  const nisabValue = useMemo(() => {
    switch (settings.nisabMode) {
      case 'GOLD':
        return goldNisab;
      case 'SILVER':
        return silverNisab;
      case 'MANUAL':
        return manualNisab;
      default:
        return goldNisab;
    }
  }, [settings.nisabMode, goldNisab, silverNisab, manualNisab]);

  const formatOrDash = (value: number) => (
    Number.isFinite(value) ? formatCurrency(value) : '—'
  );

  const nisabDescriptor = useMemo(() => {
    switch (settings.nisabMode) {
      case 'GOLD':
        return 'Gold (85 grams)';
      case 'SILVER':
        return 'Silver (595 grams)';
      case 'MANUAL':
        return 'Manual amount';
      default:
        return '';
    }
  }, [settings.nisabMode]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your Zakat calculation preferences and fiqh policies
          </p>
        </div>
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            Unsaved Changes
          </Badge>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Currency & Calculation */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Currency & Rates</h2>
              <p className="text-sm text-muted-foreground">Base currency and conversion settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Select
                value={settings.baseCurrency}
                onValueChange={(value) => updateSetting('baseCurrency', value as Currency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.value} value={currency.value}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                All calculations will be displayed in this currency
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Exchange Rates</p>
                  <p className="text-xs text-muted-foreground">Last updated: {formatUpdatedAt(exchangeRatesUpdatedAt)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefreshExchangeRates} disabled={isRefreshingRates}>
                  <RefreshCw className={`w-3 h-3 mr-2 ${isRefreshingRates ? 'animate-spin' : ''}`} />
                  {isRefreshingRates ? 'Refreshing…' : 'Refresh'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Gold & Silver Prices</p>
                  <p className="text-xs text-muted-foreground">Last updated: {formatUpdatedAt(metalPricesUpdatedAt)}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefreshMetalPrices} disabled={isRefreshingMetals}>
                  <RefreshCw className={`w-3 h-3 mr-2 ${isRefreshingMetals ? 'animate-spin' : ''}`} />
                  {isRefreshingMetals ? 'Refreshing…' : 'Refresh'}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="nisabMode">Nisab Benchmark</Label>
              <Select
                value={settings.nisabMode}
                onValueChange={(value) => updateSetting('nisabMode', value as NisabMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOLD">Gold (85 grams) - Recommended</SelectItem>
                  <SelectItem value="SILVER">Silver (595 grams)</SelectItem>
                  <SelectItem value="MANUAL">Manual Override</SelectItem>
                </SelectContent>
              </Select>
              {settings.nisabMode === 'MANUAL' && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="nisabManualAmount" className="text-xs text-foreground">
                    Manual Nisab Amount ({settings.baseCurrency})
                  </Label>
                  <Input
                    id="nisabManualAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualNisabInput}
                    onChange={(e) => handleManualNisabInputChange(e.target.value)}
                    placeholder={`Enter amount in ${settings.baseCurrency}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    This value overrides the automatically calculated nisab.
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Current nisab ({nisabDescriptor}): {formatOrDash(nisabValue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Gold 85g: {formatOrDash(goldNisab)} • Silver 595g: {formatOrDash(silverNisab)}
              </p>
            </div>
          </div>
        </Card>

        {/* Calendar & Due Date */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Calendar & Due Date</h2>
              <p className="text-sm text-muted-foreground">Set your Zakat anniversary date</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="calendar">Calendar System</Label>
              <Select
                value={settings.calendar}
                onValueChange={(value) => updateSetting('calendar', value as CalendarSystem)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIJRI">Hijri (Lunar) - Traditional</SelectItem>
                  <SelectItem value="GREGORIAN">Gregorian (Solar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="anchorDate">Anchor Date (Your Hawl Anniversary)</Label>
              <Input
                type="date"
                value={settings.anchorDate.gregorian}
                onChange={(e) => updateSetting('anchorDate', {
                  ...settings.anchorDate,
                  gregorian: e.target.value
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The date when your wealth first reached nisab
              </p>
            </div>

            {settings.calendar === 'HIJRI' && (
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm text-foreground font-medium mb-2">Next Due Date (Estimated):</p>
                <p className="text-sm text-muted-foreground">
                  11 Muharram 1447 AH (July 18, 2025)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hijri calculations are approximate. Consult local Islamic calendar for precision.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Fiqh Policies */}
        <Card className="p-6 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Fiqh Policies</h2>
              <p className="text-sm text-muted-foreground">
                Configure Islamic jurisprudence preferences for your calculation
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Include Minors' Cash</Label>
                  <p className="text-xs text-muted-foreground">
                    Include cash held on behalf of minor children in your calculation
                  </p>
                </div>
                <Switch
                  checked={settings.fiqh.includeMinorsCash}
                  onCheckedChange={(checked) => updateFiqhSetting('includeMinorsCash', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Jewelry Treatment (Gold/Silver)</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="jewelry-include"
                      name="jewelry"
                      checked={settings.fiqh.jewelryPolicy === 'INCLUDE_METAL'}
                      onChange={() => updateFiqhSetting('jewelryPolicy', 'INCLUDE_METAL')}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="jewelry-include" className="text-sm font-normal">
                      Include metal value (Prudent approach)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="jewelry-exclude"
                      name="jewelry"
                      checked={settings.fiqh.jewelryPolicy === 'EXCLUDE_PERSONAL'}
                      onChange={() => updateFiqhSetting('jewelryPolicy', 'EXCLUDE_PERSONAL')}
                      className="w-4 h-4 text-primary"
                    />
                    <Label htmlFor="jewelry-exclude" className="text-sm font-normal">
                      Exclude personal-use jewelry
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Consult your local scholar for guidance on jewelry treatment
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Personal Gold/Silver Items</Label>
                  <p className="text-xs text-muted-foreground">
                    Include gold/silver content in watches, pens, etc.
                  </p>
                </div>
                <Switch
                  checked={settings.fiqh.includePersonalGoldContent}
                  onCheckedChange={(checked) => updateFiqhSetting('includePersonalGoldContent', checked)}
                />
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Fiqh Reminder</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This app provides computational assistance only. The default settings follow widely
                  accepted opinions, but different schools of thought may have varying rulings.
                  Always consult qualified Islamic scholars for your specific circumstances.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card className="p-6 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Data & Privacy</h2>
              <p className="text-sm text-muted-foreground">Manage your local data</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-foreground" />
                  <Label>High Contrast Mode</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Increases contrast and removes transparency for better readability
                </p>
              </div>
              <Switch
                checked={settings.highContrast || false}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="destructive" className="justify-start" onClick={clearAllData}>
                <Shield className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-accent/30 rounded-lg">
            <p className="text-sm text-foreground font-medium mb-1">Privacy First</p>
            <p className="text-xs text-muted-foreground">
              All your data is stored locally on your device. Nothing is sent to external servers
              unless you explicitly choose to use online rate providers.
            </p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          onClick={saveSettings}
          disabled={!hasUnsavedChanges}
          className="min-w-32"
        >
          Save Settings
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
