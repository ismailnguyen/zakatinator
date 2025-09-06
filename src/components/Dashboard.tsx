import { Calendar, TrendingUp, Coins, Calculator, FileText, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data for initial display
const mockData = {
  nextDueDate: {
    hijri: "11 Muharram 1447",
    gregorian: "July 18, 2025",
    daysRemaining: 142
  },
  nisab: {
    benchmark: "Gold (85g)",
    amount: 5950.00,
    currency: "EUR"
  },
  calculation: {
    grossAssets: 125000.00,
    deductions: 8400.00,
    netAssets: 116600.00,
    zakatDue: 2915.00,
    status: "DUE" as const
  }
};

export function Dashboard() {
  const formatCurrency = (amount: number, currency = "EUR") => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Assalamu Alaikum
        </h1>
        <p className="text-muted-foreground">
          Your private Zakat calculation dashboard
        </p>
      </div>

      {/* Due Date Card */}
      <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm opacity-90">Next Zakat Due Date</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {mockData.nextDueDate.hijri}
            </h2>
            <p className="text-sm opacity-90">
              {mockData.nextDueDate.gregorian}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {mockData.nextDueDate.daysRemaining}
            </div>
            <div className="text-sm opacity-90">days remaining</div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Nisab */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nisab</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(mockData.nisab.amount)}
              </p>
              <p className="text-xs text-muted-foreground">{mockData.nisab.benchmark}</p>
            </div>
          </div>
        </Card>

        {/* Gross Assets */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gross Assets</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(mockData.calculation.grossAssets)}
              </p>
            </div>
          </div>
        </Card>

        {/* Net Assets */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Assets</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(mockData.calculation.netAssets)}
              </p>
              <p className="text-xs text-muted-foreground">
                After deductions: {formatCurrency(mockData.calculation.deductions)}
              </p>
            </div>
          </div>
        </Card>

        {/* Zakat Due */}
        <Card className="p-6 shadow-card border-l-4 border-l-success">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zakat Due (2.5%)</p>
              <p className="text-xl font-bold text-success">
                {formatCurrency(mockData.calculation.zakatDue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Calculation Flow */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Calculation Breakdown</h3>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          <div className="flex flex-col items-center min-w-0">
            <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Gross Assets</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(mockData.calculation.grossAssets)}
            </p>
          </div>
          
          <div className="flex-shrink-0 w-8 h-0.5 bg-border"></div>
          
          <div className="flex flex-col items-center min-w-0">
            <div className="w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-destructive">−</span>
            </div>
            <p className="text-sm font-medium text-foreground">Deductions</p>
            <p className="text-lg font-bold text-destructive">
              {formatCurrency(mockData.calculation.deductions)}
            </p>
          </div>
          
          <div className="flex-shrink-0 w-8 h-0.5 bg-border"></div>
          
          <div className="flex flex-col items-center min-w-0">
            <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-foreground">=</span>
            </div>
            <p className="text-sm font-medium text-foreground">Net Assets</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(mockData.calculation.netAssets)}
            </p>
          </div>
          
          <div className="flex-shrink-0 w-8 h-0.5 bg-border"></div>
          
          <div className="flex flex-col items-center min-w-0">
            <div className="w-16 h-16 bg-success/10 rounded-xl flex items-center justify-center mb-2">
              <span className="text-sm font-bold text-success">2.5%</span>
            </div>
            <p className="text-sm font-medium text-foreground">Zakat Due</p>
            <p className="text-lg font-bold text-success">
              {formatCurrency(mockData.calculation.zakatDue)}
            </p>
          </div>
        </div>
      </Card>

      {/* Status & Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              {mockData.calculation.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Above nisab threshold
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your net assets exceed the nisab threshold of {formatCurrency(mockData.nisab.amount)}. 
            Zakat is due on the calculated amount.
          </p>
        </Card>

        <Card className="p-6 shadow-card">
          <h4 className="text-lg font-semibold text-foreground mb-4">Actions</h4>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Export Calculation (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}