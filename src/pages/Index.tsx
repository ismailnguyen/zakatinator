import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  return (
    <Layout currentPage="dashboard">
      <Dashboard />
    </Layout>
  );
};

export default Index;
