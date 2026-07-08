import React, { useState } from "react";
import { TopBar } from "./components/TopBar";
import { PatientPortal } from "./components/PatientPortal";
import { TrialBrowser } from "./components/TrialBrowser";
import { SponsorDashboard } from "./components/SponsorDashboard";
import { HowItWorks } from "./components/HowItWorks";
import { useWallet } from "./hooks/useWallet";
import { ToastProvider } from "./context/ToastContext";

type Tab = "patient" | "trials" | "sponsor" | "how";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("how");
  const wallet = useWallet();

  return (
    <ToastProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <TopBar wallet={wallet} />

        {/* Main nav bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "0 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--void-2)",
        }}>
          {(["how", "patient", "trials", "sponsor"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid var(--amber)" : "2px solid transparent",
                padding: "12px 20px",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: activeTab === tab ? "var(--amber)" : "var(--text-muted)",
                transition: "all 0.15s ease",
                marginBottom: "-1px",
              }}
            >
              {tab === "how" ? "How It Works" :
               tab === "patient" ? "Patient Portal" :
               tab === "trials" ? "Trial Browser" : "Sponsor Dashboard"}
            </button>
          ))}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
            <span className="status-dot active" />
            <span className="t-caption">Sepolia Testnet</span>
            <span style={{ color: "var(--border-bright)", margin: "0 4px" }}>|</span>
            <span className="t-caption" style={{ color: "var(--encrypted)" }}>FHE Active</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
          {activeTab === "how"     && <HowItWorks />}
          {activeTab === "patient" && <PatientPortal wallet={wallet} />}
          {activeTab === "trials"  && <TrialBrowser wallet={wallet} />}
          {activeTab === "sponsor" && <SponsorDashboard wallet={wallet} />}
        </div>
      </div>
    </ToastProvider>
  );
}