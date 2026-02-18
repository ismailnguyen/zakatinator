import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InventoryPage from "./pages/InventoryPage";
import SettingsPage from "./pages/SettingsPage";
import BreakdownPage from "./pages/BreakdownPage";
import NotFound from "./pages/NotFound";
import WelcomePage from "./pages/WelcomePage";
import HistoryPage from "./pages/HistoryPage";
import { refreshExchangeRates, refreshMetalPrices, getSettings, applyTheme, getDefaultSettings } from "@/lib/store";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const warmUpMarketData = async () => {
      // Apply theme preference immediately
      const settings = getSettings() || getDefaultSettings();
      applyTheme(settings.highContrast || false);

      try {
        await refreshExchangeRates();
      } catch (error) {
        console.error("Failed to refresh exchange rates", error);
      }

      try {
        await refreshMetalPrices();
      } catch (error) {
        console.error("Failed to refresh metal prices", error);
      }
    };

    warmUpMarketData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/breakdown" element={<BreakdownPage />} />
            <Route path="/history" element={<HistoryPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
