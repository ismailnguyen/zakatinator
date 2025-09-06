import { useState, useEffect } from "react";
import { Plus, Search, Filter, Wallet, Coins, DollarSign, Smartphone, Building, Gem, Archive, Edit2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItem, AssetType } from "@/types/zakat";
import { getInventory as loadInventoryFromStore, setInventory as saveInventoryToStore } from "@/lib/store";
import { AddAssetDialog } from "@/components/AddAssetDialog";
import { EditAssetDialog } from "@/components/EditAssetDialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    label: 'Compte courant BNP Paribas',
    type: 'CASH',
    ownership: 'SELF',
    currency: 'EUR',
    amount: 15420.50,
    archived: false,
    notes: 'Compte principal',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    label: 'PEA Boursorama',
    type: 'PEA',
    ownership: 'SELF',
    currency: 'EUR',
    amount: 45680.00,
    archived: false,
    notes: 'Portefeuille diversifié ETF',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-01'
  },
  {
    id: '3',
    label: 'Bitcoin',
    type: 'CRYPTO',
    ownership: 'SELF',
    token: 'BTC',
    quantity: 0.5,
    pricePerToken: 65000,
    currency: 'USD',
    archived: false,
    notes: 'Cold storage',
    createdAt: '2023-12-01',
    updatedAt: '2024-03-15'
  },
  {
    id: '4',
    label: 'Lingot or 100g',
    type: 'GOLD',
    ownership: 'SELF',
    metal: 'GOLD',
    weightG: 100,
    purity: 0.9999,
    archived: false,
    notes: 'Coffre bancaire',
    createdAt: '2023-08-20',
    updatedAt: '2023-08-20'
  },
  {
    id: '5',
    label: 'Alliance en or (épouse)',
    type: 'JEWELRY',
    ownership: 'SPOUSE',
    metal: 'GOLD',
    weightG: 8,
    purity: 0.750,
    archived: false,
    notes: 'Usage personnel',
    createdAt: '2022-06-15',
    updatedAt: '2022-06-15'
  }
];

const assetTypeConfig: Record<AssetType, { icon: any; label: string; color: string }> = {
  CASH: { icon: Wallet, label: 'Cash', color: 'bg-blue-500' },
  CASH_MINOR: { icon: Wallet, label: 'Minor Cash', color: 'bg-blue-400' },
  ASSURANCE_VIE: { icon: Building, label: 'Life Insurance', color: 'bg-purple-500' },
  PEA: { icon: DollarSign, label: 'PEA', color: 'bg-green-500' },
  CRYPTO: { icon: Smartphone, label: 'Cryptocurrency', color: 'bg-orange-500' },
  FX_CASH: { icon: DollarSign, label: 'Foreign Cash', color: 'bg-teal-500' },
  GOLD: { icon: Coins, label: 'Gold', color: 'bg-yellow-500' },
  SILVER: { icon: Coins, label: 'Silver', color: 'bg-gray-400' },
  JEWELRY: { icon: Gem, label: 'Jewelry', color: 'bg-pink-500' },
  WATCH: { icon: Gem, label: 'Watch', color: 'bg-indigo-500' },
  LOAN_RECEIVABLE: { icon: Building, label: 'Loan Receivable', color: 'bg-cyan-500' },
  TRADE_STOCK: { icon: Building, label: 'Trade Stock', color: 'bg-red-500' },
  OTHER: { icon: Wallet, label: 'Other', color: 'bg-gray-500' }
};

export function Inventory() {
  const { toast } = useToast();
  const initial = loadInventoryFromStore();
  const [items, setItems] = useState<InventoryItem[]>(initial.length ? initial : mockInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesArchived = showArchived ? item.archived : !item.archived;
    return matchesSearch && matchesType && matchesArchived;
  });

  const handleAddAsset = (newItemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setItems(prev => [...prev, newItem]);
  };

  const handleEditAsset = (item: InventoryItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  // Persist inventory to localStorage whenever it changes
  useEffect(() => {
    try { saveInventoryToStore(items); } catch (e) { /* ignore */ }
  }, [items]);

  const handleSaveEdit = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleArchiveAsset = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, archived: !item.archived, updatedAt: new Date().toISOString() }
        : item
    ));

    toast({
      title: item.archived ? "Asset Restored" : "Asset Archived",
      description: `${item.label} has been ${item.archived ? 'restored' : 'archived'}.`,
    });
  };

  const formatValue = (item: InventoryItem): string => {
    if (item.type === 'CRYPTO' && item.quantity && item.pricePerToken) {
      return `${item.quantity} ${item.token} (≈${(item.quantity * item.pricePerToken).toLocaleString()} ${item.currency})`;
    } else if ((item.type === 'GOLD' || item.type === 'SILVER' || item.type === 'JEWELRY') && item.weightG) {
      return `${item.weightG}g ${item.metal} (${(item.purity! * 100).toFixed(1)}%)`;
    } else if (item.amount && item.currency) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: item.currency
      }).format(item.amount);
    }
    return 'N/A';
  };

  const getTotalValue = (): string => {
    // Simplified total calculation (would need proper conversion rates)
    const eurItems = filteredItems.filter(item => item.currency === 'EUR');
    const total = eurItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(total);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your zakatable assets and wealth
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className={showArchived ? "bg-muted" : ""}
          >
            <Archive className="w-4 h-4 mr-2" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button 
            className="bg-gradient-primary hover:bg-primary"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-semibold text-foreground">{filteredItems.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. EUR Value</p>
              <p className="text-xl font-semibold text-foreground">{getTotalValue()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precious Metals</p>
              <p className="text-xl font-semibold text-foreground">
                {filteredItems.filter(item => ['GOLD', 'SILVER', 'JEWELRY'].includes(item.type)).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Investments</p>
              <p className="text-xl font-semibold text-foreground">
                {filteredItems.filter(item => ['PEA', 'CRYPTO', 'ASSURANCE_VIE'].includes(item.type)).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="PEA">PEA</SelectItem>
              <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
              <SelectItem value="GOLD">Gold</SelectItem>
              <SelectItem value="SILVER">Silver</SelectItem>
              <SelectItem value="JEWELRY">Jewelry</SelectItem>
              <SelectItem value="ASSURANCE_VIE">Life Insurance</SelectItem>
              <SelectItem value="LOAN_RECEIVABLE">Loan Receivable</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Assets List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const config = assetTypeConfig[item.type];
          const IconComponent = config.icon;
          
          return (
            <Card key={item.id} className="p-6 shadow-card hover:shadow-elegant transition-smooth">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", config.color)}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">{item.label}</h3>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                      {item.ownership !== 'SELF' && (
                        <Badge variant="secondary" className="text-xs">
                          {item.ownership}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{formatValue(item)}</span>
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span>{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAsset(item)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleArchiveAsset(item.id)}
                    className={item.archived ? "text-success hover:text-success" : "text-muted-foreground"}
                  >
                    {item.archived ? (
                      <>
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restore
                      </>
                    ) : (
                      <>
                        <Archive className="w-3 h-3 mr-1" />
                        Archive
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center shadow-card">
          {showArchived ? (
            <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          ) : (
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          )}
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {showArchived ? 'No archived assets' : 'No assets found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {showArchived ? (
              'No assets have been archived yet'
            ) : searchTerm || filterType !== 'all' ? (
              'Try adjusting your search or filters'
            ) : (
              'Start by adding your first asset to calculate Zakat'
            )}
          </p>
          {!showArchived && (
            <Button 
              className="bg-gradient-primary hover:bg-primary"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Asset
            </Button>
          )}
        </Card>
      )}

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddAsset}
      />

      {/* Edit Asset Dialog */}
      <EditAssetDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={editingItem}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
