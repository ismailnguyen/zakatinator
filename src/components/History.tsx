import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHistory } from "@/lib/history";
import { buildPrintableHtml } from "@/lib/print";
import { CalculationResult } from "@/types/zakat";
import { FileText, Receipt, Clock } from "lucide-react";

export function History() {
  const history = getHistory();

  const exportCalc = (calc: CalculationResult) => {
    const html = buildPrintableHtml(calc);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-1">Past calculations and payments</p>
        </div>
      </div>

      <Card className="p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Calculations</h2>
        {history.calculations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No calculations saved yet.</p>
        ) : (
          <div className="space-y-3">
            {history.calculations.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-3 bg-card/60 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{new Date(c.timestamp).toLocaleString()}</span>
                      <Badge variant="outline" className={c.status === 'DUE' ? 'bg-success/10 text-success border-success/20' : ''}>{c.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Zakat Due: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: c.settings.baseCurrency }).format(c.zakatDue)}
                    </div>
                  </div>
                </div>
                <div>
                  <Button variant="outline" onClick={() => exportCalc(c)}>Re-export PDF</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Payments</h2>
        {history.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {history.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 bg-card/60 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-foreground font-medium">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: p.currency }).format(p.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(p.paidDate).toLocaleString()}
                    </div>
                    {p.notes && <div className="text-xs text-muted-foreground">{p.notes}</div>}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Calc: {p.calculationId}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

