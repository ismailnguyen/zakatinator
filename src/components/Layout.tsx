import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Calculator, Settings, TrendingUp, Wallet } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'inventory' | 'settings' | 'breakdown';
}

const navigation = [
  { name: 'Dashboard', icon: TrendingUp, page: 'dashboard' as const, path: '/' },
  { name: 'Inventory', icon: Wallet, page: 'inventory' as const, path: '/inventory' },
  { name: 'Settings', icon: Settings, page: 'settings' as const, path: '/settings' },
  { name: 'Breakdown', icon: Calculator, page: 'breakdown' as const, path: '/breakdown' },
];

export function Layout({ children, currentPage = 'dashboard' }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current page from URL if not provided
  const getCurrentPage = () => {
    if (currentPage !== 'dashboard') return currentPage;
    
    const path = location.pathname;
    const navItem = navigation.find(item => item.path === path);
    return navItem?.page || 'dashboard';
  };

  const activePage = getCurrentPage();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Zakat Calculator</h1>
                <p className="text-xs text-muted-foreground">Privacy-first Islamic finance</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-smooth",
                    activePage === item.page
                      ? "bg-primary text-primary-foreground shadow-elegant"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}