import { Layout } from "@/components/Layout";
import { Settings } from "@/components/Settings";

const SettingsPage = () => {
  return (
    <Layout currentPage="settings">
      <Settings />
    </Layout>
  );
};

export default SettingsPage;