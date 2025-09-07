import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Globe } from "lucide-react";
import { Currency, ZakatSettings } from "@/types/zakat";
import { setSettings, getDefaultSettings } from "@/lib/store";
import { setOnboardingPhase } from "@/lib/onboarding";
import { useNavigate } from "react-router-dom";

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

export default function WelcomePage() {
  const nav = useNavigate();
  const def = getDefaultSettings();
  const [currency, setCurrency] = useState<Currency>(def.baseCurrency);
  const [hawlDate, setHawlDate] = useState<string>(def.anchorDate.gregorian);

  const start = () => {
    const settings: ZakatSettings = {
      ...def,
      baseCurrency: currency,
      anchorDate: { gregorian: hawlDate },
    };
    setSettings(settings);
    setOnboardingPhase('inventory');
    nav('/inventory');
  };

  return (
    <Layout currentPage="settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Zakatinator</h1>
          <p className="text-muted-foreground">Let’s set up the basics. You can change these later.</p>
        </div>

        <Card className="p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center"><Globe className="w-5 h-5 text-primary-foreground" /></div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Choose your currency</h2>
              <p className="text-sm text-muted-foreground">All results will be displayed in this currency.</p>
            </div>
          </div>

          <div>
            <Label>Base Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2"><span className="font-medium">{c.symbol}</span><span>{c.label}</span></div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-secondary-foreground" /></div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Select your hawl (anniversary) date</h2>
              <p className="text-sm text-muted-foreground">This is when your wealth first reached nisab.</p>
            </div>
          </div>

          <div>
            <Label>Anchor Date</Label>
            <Input type="date" value={hawlDate} onChange={(e) => setHawlDate(e.target.value)} />
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">You can adjust other settings later in Settings.</p>
          <Button onClick={start}>Continue to Inventory</Button>
        </div>
      </div>
    </Layout>
  );
}

