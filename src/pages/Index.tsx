import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { useEffect } from "react";
import { getOnboardingPhase } from "@/lib/onboarding";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const nav = useNavigate();
  useEffect(() => {
    const phase = getOnboardingPhase();
    if (phase === 'welcome') nav('/welcome', { replace: true });
    else if (phase === 'inventory') nav('/inventory', { replace: true });
  }, [nav]);

  return (
    <Layout currentPage="dashboard">
      <Dashboard />
    </Layout>
  );
};

export default Index;
