import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeductionItem, Currency } from "@/types/zakat";
import { useToast } from "@/hooks/use-toast";

interface AddDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<DeductionItem, "id" | "createdAt" | "updatedAt">) => void;
}

const currencies: { value: Currency; label: string }[] = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
  { value: "SAR", label: "Saudi Riyal (ر.س)" },
  { value: "AED", label: "UAE Dirham (د.إ)" },
  { value: "QAR", label: "Qatari Riyal (ر.ق)" },
];

export function AddDeductionDialog({ open, onOpenChange, onAdd }: AddDeductionDialogProps) {
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const resetForm = () => {
    setLabel("");
    setAmount("");
    setCurrency("EUR");
    setDueDate("");
    setNotes("");
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!label.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a description for this deduction.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a positive deduction amount.",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      label: label.trim(),
      currency,
      amount: numericAmount,
      dueDate: dueDate || undefined,
      notes: notes.trim(),
    });

    toast({
      title: "Deduction Added",
      description: `${label} has been saved.`,
    });

    onOpenChange(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Deduction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deduction-label">Description</Label>
            <Input
              id="deduction-label"
              placeholder="E.g. Outstanding rent payment"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deduction-amount">Amount</Label>
              <Input
                id="deduction-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deduction-currency">Currency</Label>
              <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger id="deduction-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deduction-date">Due Date (optional)</Label>
            <Input
              id="deduction-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deduction-notes">Notes (optional)</Label>
            <Textarea
              id="deduction-notes"
              placeholder="Add context about this liability..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:bg-primary">
              Add Deduction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
