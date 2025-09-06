import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe, Coins, Scale, Download, Upload, Shield } from "lucide-react";
import { ZakatSettings, Currency, CalendarSystem, NisabMode } from "@/types/zakat";
import { getSettings as loadSettingsFromStore, setSettings as saveSettingsToStore } from "@/lib/store";

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
  const [settings, setSettings] = useState<ZakatSettings>(loadSettingsFromStore() || defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSetting = <K extends keyof ZakatSettings>(
    key: K,
    value: ZakatSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

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

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'zakat-settings.json';
    link.click();
  };

  const formatCurrency = (amount: number) => {
    const currency = currencies.find(c => c.value === settings.baseCurrency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.baseCurrency
    }).format(amount);
  };

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
              <p className="text-xs text-muted-foreground mt-1">
                Current nisab: {formatCurrency(5950)} (mock value)
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

        {/* Backup & Security */}
        <Card className="p-6 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Backup & Security</h2>
              <p className="text-sm text-muted-foreground">
                Manage your data and privacy settings
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" onClick={exportSettings} className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            <Button variant="outline" className="justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
            <Button variant="outline" className="justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
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
