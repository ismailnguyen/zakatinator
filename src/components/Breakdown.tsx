import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, MinusCircle, Calculator, Coins, Gem, DollarSign, Building, Wallet, CheckCircle } from "lucide-react";
import { ZakatCalculator } from "@/lib/zakat-calculator";
import { AssetType, CalculationResult, DeductionItem, InventoryItem, ZakatSettings } from "@/types/zakat";

const assetTypeLabels: Record<AssetType, string> = {
  CASH: 'Cash',
  CASH_MINOR: 'Minor Cash',
  ASSURANCE_VIE: 'Life Insurance',
  PEA: 'PEA',
  CRYPTO: 'Cryptocurrency',
  FX_CASH: 'Foreign Cash',
  GOLD: 'Gold',
  SILVER: 'Silver',
  JEWELRY: 'Jewelry',
  WATCH: 'Watch',
  LOAN_RECEIVABLE: 'Loan Receivable',
  TRADE_STOCK: 'Trade Stock',
  OTHER: 'Other'
};

const typeIcon: Partial<Record<AssetType, any>> = {
  CASH: Wallet,
  CASH_MINOR: Wallet,
  ASSURANCE_VIE: Building,
  PEA: DollarSign,
  CRYPTO: DollarSign,
  FX_CASH: DollarSign,
  GOLD: Coins,
  SILVER: Coins,
  JEWELRY: Gem,
  WATCH: Gem,
  LOAN_RECEIVABLE: Building,
  TRADE_STOCK: Building,
  OTHER: Wallet,
};

export function Breakdown() {
  // Mock inputs for demonstration. In a full app, read user data.
  const settings: ZakatSettings = {
    baseCurrency: 'EUR',
    calendar: 'HIJRI',
    anchorDate: { gregorian: '2024-03-20' },
    nisabMode: 'GOLD',
    fiqh: {
      includeMinorsCash: true,
      jewelryPolicy: 'INCLUDE_METAL',
      includePersonalGoldContent: false,
    },
    rounding: 2,
  };

  const inventory: InventoryItem[] = [
    { id: '1', label: 'Checking (BNP Paribas)', type: 'CASH', ownership: 'SELF', currency: 'EUR', amount: 15420.5, archived: false, notes: '', createdAt: '', updatedAt: '' },
    { id: '2', label: 'PEA Portfolio', type: 'PEA', ownership: 'SELF', currency: 'EUR', amount: 45680, archived: false, notes: '', createdAt: '', updatedAt: '' },
    { id: '3', label: 'Bitcoin', type: 'CRYPTO', ownership: 'SELF', token: 'BTC', quantity: 0.5, pricePerToken: 65000, currency: 'USD', archived: false, notes: '', createdAt: '', updatedAt: '' },
    { id: '4', label: 'Gold bar 100g', type: 'GOLD', ownership: 'SELF', metal: 'GOLD', weightG: 100, purity: 0.9999, archived: false, notes: '', createdAt: '', updatedAt: '' },
    { id: '5', label: "Spouse's ring", type: 'JEWELRY', ownership: 'SPOUSE', metal: 'GOLD', weightG: 8, purity: 0.75, archived: false, notes: 'Personal use', createdAt: '', updatedAt: '' },
  ];

  const deductions: DeductionItem[] = [
    { id: 'd1', label: 'Credit card bill (due)', currency: 'EUR', amount: 1200, notes: '', createdAt: '', updatedAt: '' },
  ];

  const exchangeRates = {
    'USD_EUR': 0.92,
  } as Record<string, number>;

  const metalPrices = {
    goldPerGram: 60, // EUR
    silverPerGram: 0.7, // EUR
    lastUpdated: new Date().toISOString(),
  };

  const result = useMemo<Omit<CalculationResult, 'id' | 'timestamp'>>(() => {
    return ZakatCalculator.calculate(inventory, deductions, settings, exchangeRates, metalPrices);
  }, [inventory, deductions, settings, exchangeRates, metalPrices]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: settings.baseCurrency }).format(amount);

  const byType = Object.entries(result.breakdown.byType).sort((a, b) => b[1] - a[1]) as [AssetType, number][];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calculation Breakdown</h1>
          <p className="text-muted-foreground mt-1">Detailed view of included assets, deductions, and zakat due</p>
        </div>
        <Badge variant={result.status === 'DUE' ? 'outline' : 'secondary'} className={result.status === 'DUE' ? 'bg-success/10 text-success border-success/20' : ''}>
          {result.status}
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gross Assets</p>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(result.grossAssets)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <MinusCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deductions</p>
              <p className="text-lg font-semibold text-destructive">{formatCurrency(result.deductionsTotal)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Assets</p>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(result.netAssets)}</p>
              <p className="text-xs text-muted-foreground">Nisab: {formatCurrency(result.nisabValue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card border-l-4 border-l-success">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zakat Due (2.5%)</p>
              <p className="text-xl font-bold text-success">{formatCurrency(result.zakatDue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* By Asset Type */}
      <Card className="p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">By Asset Type</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-1/3">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byType.map(([type, amount]) => {
              const share = result.grossAssets > 0 ? (amount / result.grossAssets) * 100 : 0;
              const Icon = typeIcon[type as keyof typeof typeIcon] || Wallet;
              return (
                <TableRow key={type}>
                  <TableCell className="flex items-center gap-2">
                    <span className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </span>
                    <span className="font-medium text-foreground">{assetTypeLabels[type]}</span>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress value={share} />
                      </div>
                      <div className="w-12 text-right text-sm text-muted-foreground">{share.toFixed(0)}%</div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {byType.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No included assets</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Itemized Breakdown */}
      <Card className="p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Itemized Breakdown</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Original</TableHead>
              <TableHead>Converted</TableHead>
              <TableHead>Included</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.breakdown.items.map((it) => (
              <TableRow key={it.id}>
                <TableCell className="font-medium text-foreground">{it.label}</TableCell>
                <TableCell>
                  <Badge variant="outline">{assetTypeLabels[it.type]}</Badge>
                </TableCell>
                <TableCell>
                  {it.originalCurrency != null
                    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: it.originalCurrency }).format(it.originalValue)
                    : '—'}
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(it.convertedValue)}</TableCell>
                <TableCell>
                  {it.included ? (
                    <Badge className="bg-success/10 text-success border-success/20" variant="outline">Included</Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline">Excluded</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{it.reason || ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Deductions List */}
      <Card className="p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-2">Deductions</h2>
        {deductions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deductions applied</p>
        ) : (
          <ul className="space-y-2">
            {deductions.map((d) => (
              <li key={d.id} className="flex items-center justify-between">
                <span className="text-foreground">{d.label}</span>
                <span className="text-foreground font-medium">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: d.currency }).format(d.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        For educational use. Always consult qualified scholars for fiqh guidance.
      </p>
    </div>
  );
}

