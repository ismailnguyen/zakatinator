import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AssetType, InventoryItem, Currency, Ownership } from "@/types/zakat";
import { useToast } from "@/hooks/use-toast";

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'CASH', label: 'Cash / Current Account' },
  { value: 'CASH_MINOR', label: 'Minor\'s Cash Account' },
  { value: 'ASSURANCE_VIE', label: 'Life Insurance (Assurance-vie)' },
  { value: 'ASSURANCE_VIE', label: 'Life Insurance (Assurance-vie)' },
  { value: 'STOCKS', label: 'Stock Options (Actions, PEA, CTO)' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'FX_CASH', label: 'Foreign Currency' },
  { value: 'GOLD', label: 'Gold (Bullion/Coins)' },
  { value: 'SILVER', label: 'Silver (Bullion/Coins)' },
  { value: 'JEWELRY', label: 'Jewelry' },
  { value: 'WATCH', label: 'Watch (Luxury)' },
  { value: 'LOAN_RECEIVABLE', label: 'Loan Receivable' },
  { value: 'TRADE_STOCK', label: 'Business Inventory' },
  { value: 'OTHER', label: 'Other Asset' },
];

const currencies: { value: Currency; label: string }[] = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'SAR', label: 'Saudi Riyal (ر.س)' },
  { value: 'AED', label: 'UAE Dirham (د.إ)' },
  { value: 'QAR', label: 'Qatari Riyal (ر.ق)' },
];

const ownerships: { value: Ownership; label: string }[] = [
  { value: 'SELF', label: 'Self' },
  { value: 'MINOR', label: 'Minor Child' },
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'JOINT', label: 'Joint Ownership' },
];

export function AddAssetDialog({ open, onOpenChange, onAdd }: AddAssetDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    label: '',
    type: 'CASH',
    ownership: 'SELF',
    currency: 'EUR',
    amount: 0,
    archived: false,
    notes: '',
  });

  const updateField = <K extends keyof InventoryItem>(key: K, value: InventoryItem[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an asset label.",
        variant: "destructive",
      });
      return;
    }

    const newItem: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
      label: formData.label,
      type: formData.type!,
      ownership: formData.ownership!,
      archived: false,
      notes: formData.notes || '',

      // Currency-based fields
      currency: needsCurrency() ? formData.currency : undefined,
      amount: needsCurrency() ? (formData.amount || 0) : undefined,

      // Metal fields
      metal: needsMetal() ? (formData.metal as 'GOLD' | 'SILVER') : undefined,
      weightG: needsMetal() ? formData.weightG : undefined,
      purity: needsMetal() ? formData.purity : undefined,

      // Crypto fields
      token: needsCrypto() ? formData.token : undefined,
      quantity: needsCrypto() ? formData.quantity : undefined,
      pricePerToken: needsCrypto() ? formData.pricePerToken : undefined,

      // Loan fields
      loanStrength: needsLoan() ? formData.loanStrength : undefined,

      // Override
      includeOverride: formData.includeOverride,
    };

    onAdd(newItem);

    toast({
      title: "Asset Added",
      description: `${formData.label} has been added to your inventory.`,
    });

    // Reset form
    setFormData({
      label: '',
      type: 'CASH',
      ownership: 'SELF',
      currency: 'EUR',
      amount: 0,
      archived: false,
      notes: '',
    });

    onOpenChange(false);
  };

  const needsCurrency = () => {
    return ['CASH', 'CASH_MINOR', 'ASSURANCE_VIE', 'STOCKS', 'FX_CASH', 'TRADE_STOCK', 'OTHER'].includes(formData.type!);
  };

  const needsMetal = () => {
    return ['GOLD', 'SILVER', 'JEWELRY', 'WATCH'].includes(formData.type!);
  };

  const needsCrypto = () => {
    return formData.type === 'CRYPTO';
  };

  const needsLoan = () => {
    return formData.type === 'LOAN_RECEIVABLE';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Add New Asset
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Basic Info */}
            <div className="md:col-span-2">
              <Label htmlFor="label">Asset Label *</Label>
              <Input
                id="label"
                placeholder="e.g., Compte courant BNP, Bitcoin wallet, Gold coins"
                value={formData.label}
                onChange={(e) => updateField('label', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Asset Type *</Label>
              <Select value={formData.type} onValueChange={(value) => updateField('type', value as AssetType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ownership">Ownership</Label>
              <Select value={formData.ownership} onValueChange={(value) => updateField('ownership', value as Ownership)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ownerships.map(owner => (
                    <SelectItem key={owner.value} value={owner.value}>
                      {owner.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency-based fields */}
            {needsCurrency() && (
              <>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => updateField('currency', value as Currency)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </>
            )}

            {/* Metal fields */}
            {needsMetal() && (
              <>
                <div>
                  <Label htmlFor="metal">Metal Type</Label>
                  <Select value={formData.metal} onValueChange={(value) => updateField('metal', value as 'GOLD' | 'SILVER')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOLD">Gold</SelectItem>
                      <SelectItem value="SILVER">Silver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="weightG">Weight (grams)</Label>
                  <Input
                    id="weightG"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.weightG || ''}
                    onChange={(e) => updateField('weightG', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="purity">Purity (0-1)</Label>
                  <Input
                    id="purity"
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    placeholder="0.999"
                    value={formData.purity || ''}
                    onChange={(e) => updateField('purity', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    e.g., 0.999 for 99.9% pure, 0.750 for 18K gold
                  </p>
                </div>

                <div>
                  <Label htmlFor="estimatedValue">Or Estimated Value (Optional)</Label>
                  <div className="flex gap-2">
                    <Select value={formData.currency} onValueChange={(value) => updateField('currency', value as Currency)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount || ''}
                      onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Crypto fields */}
            {needsCrypto() && (
              <>
                <div>
                  <Label htmlFor="token">Token Symbol</Label>
                  <Input
                    id="token"
                    placeholder="BTC, ETH, ADA, etc."
                    value={formData.token || ''}
                    onChange={(e) => updateField('token', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.00000001"
                    min="0"
                    placeholder="0.00000000"
                    value={formData.quantity || ''}
                    onChange={(e) => updateField('quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="pricePerToken">Price per Token</Label>
                  <div className="flex gap-2">
                    <Select value={formData.currency} onValueChange={(value) => updateField('currency', value as Currency)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.pricePerToken || ''}
                      onChange={(e) => updateField('pricePerToken', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground">
                    Or enter total value in Amount field above instead of quantity × price
                  </p>
                </div>
              </>
            )}

            {/* Loan fields */}
            {needsLoan() && (
              <>
                <div className="md:col-span-2">
                  <Label htmlFor="loanStrength">Loan Strength</Label>
                  <Select value={formData.loanStrength} onValueChange={(value) => updateField('loanStrength', value as 'STRONG' | 'WEAK')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select strength" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STRONG">Strong (likely to be repaid)</SelectItem>
                      <SelectItem value="WEAK">Weak/Uncertain</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Strong loans are included in Zakat calculation, weak loans are excluded
                  </p>
                </div>
              </>
            )}

            {/* Manual Override */}
            <div className="md:col-span-2 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Manual inclusion override</Label>
                <p className="text-xs text-muted-foreground">
                  Override automatic fiqh rules for this specific asset
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={formData.includeOverride === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField('includeOverride', false)}
                >
                  Force Exclude
                </Button>
                <Button
                  type="button"
                  variant={formData.includeOverride === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField('includeOverride', undefined)}
                >
                  Auto
                </Button>
                <Button
                  type="button"
                  variant={formData.includeOverride === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateField('includeOverride', true)}
                >
                  Force Include
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional information about this asset..."
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:bg-primary">
              Add Asset
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}