import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Calculator, Settings, TrendingUp, Wallet, FileText } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  currentPage?: 'dashboard' | 'inventory' | 'settings' | 'breakdown' | 'history';
}

const navigation = [
  { name: 'Dashboard', icon: TrendingUp, page: 'dashboard' as const, path: '/' },
  { name: 'Inventory', icon: Wallet, page: 'inventory' as const, path: '/inventory' },
  { name: 'Settings', icon: Settings, page: 'settings' as const, path: '/settings' },
  { name: 'Breakdown', icon: Calculator, page: 'breakdown' as const, path: '/breakdown' },
  { name: 'History', icon: FileText, page: 'history' as const, path: '/history' },
];

export function Layout({ children, currentPage = 'dashboard' }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCompact, setIsCompact] = useState(false);

  // Determine current page from URL if not provided
  const getCurrentPage = () => {
    if (currentPage !== 'dashboard') return currentPage;
    
    const path = location.pathname;
    const navItem = navigation.find(item => item.path === path);
    return navItem?.page || 'dashboard';
  };

  const activePage = getCurrentPage();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const compactThreshold = 140;
    const expandThreshold = 80;
    let rafId = 0;

    const updateState = () => {
      rafId = 0;
      const y = window.scrollY;
      setIsCompact((prev) => {
        if (y > compactThreshold) return true;
        if (y < expandThreshold) return false;
        return prev;
      });
    };

    const handleScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(updateState);
    };

    updateState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);
  return (
    <div className="min-h-screen">
      {isCompact && (
        <div className="fixed top-5 left-1/2 z-[60] -translate-x-1/2 px-4 transition-opacity duration-300">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-card/95 px-4 py-2 shadow-card backdrop-blur-2xl">
            <div className="flex items-center gap-2 pr-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-foreground">Zakatinator</span>
            </div>
            <span className="hidden h-6 w-px bg-white/10 sm:block" aria-hidden="true" />
            <nav className="flex items-center gap-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full text-sm transition-spring",
                    activePage === item.page
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  aria-label={item.name}
                  type="button"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="sr-only">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className={cn(
          "bg-card backdrop-blur-2xl border-b border-border shadow-card sticky top-0 z-40 transition-all duration-500",
          isCompact ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-500",
              isCompact ? "h-0 opacity-0 overflow-hidden pointer-events-none" : "h-16 opacity-100"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Zakatinator</h1>
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
                  type="button"
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
