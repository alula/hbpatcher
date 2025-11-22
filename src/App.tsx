import { useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { PatcherPage } from "./pages/PatcherPage";
import { AboutPage } from "./pages/AboutPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  const [activeTab, setActiveTab] = useState("patcher");
  const [appendSuffix, setAppendSuffix] = useState(false);

  const renderPage = () => {
    switch (activeTab) {
      case "patcher":
        return <PatcherPage appendSuffix={appendSuffix} />;
      case "about":
        return <AboutPage />;
      case "settings":
        return (
          <SettingsPage
            appendSuffix={appendSuffix}
            onAppendSuffixChange={setAppendSuffix}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-switch-text font-sans flex justify-center md:overflow-hidden">
      <div className="w-full max-w-[1280px] md:h-screen flex flex-col bg-switch-bg relative">
        <Header />

        <div className="flex flex-1 md:overflow-hidden flex-col md:flex-row">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="flex-1 overflow-auto p-8 pt-12">{renderPage()}</main>
        </div>
      </div>
    </div>
  );
}

export default App;
