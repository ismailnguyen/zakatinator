import { Layout } from "@/components/Layout";
import { Inventory } from "@/components/Inventory";

const InventoryPage = () => {
  return (
    <Layout currentPage="inventory">
      <Inventory />
    </Layout>
  );
};

export default InventoryPage;