import React, { useState } from "react";
import type { WalletState } from "../hooks/useWallet";
import { useMediVault } from "../hooks/useMediVault";
import { useToast } from "../context/ToastContext";

interface Props { wallet: WalletState; }

const ICD10_CONDITIONS = [
  { code: 1850, label: "C18.9 — Malignant neoplasm of colon" },
  { code: 4111, label: "I21.9 — Acute myocardial infarction" },
  { code: 2500, label: "E11.9 — Type 2 diabetes mellitus" },
  { code: 3420, label: "G35 — Multiple sclerosis" },
  { code: 7140, label: "M06.9 — Rheumatoid arthritis" },
  { code: 2960, label: "F31.9 — Bipolar disorder" },
];

export function PatientPortal({ wallet }: Props) {
  const { toast } = useToast();
  const { hasProfile, registerProfile, deleteProfile, loading } = useMediVault(wallet);

  const [form, setForm] = useState({
    age: "",
    conditionCode: "",
    biomarkerScore: "",
    geographicRegion: "404", // Kenya
  });
  const [step, setStep] = useState<"idle" | "encrypting" | "submitting" | "done">("idle");

  const handleRegister = async () => {
    if (!wallet.connected) { toast("Connect your wallet first", "error"); return; }
    if (!form.age || !form.conditionCode || !form.biomarkerScore) {
      toast("All fields required", "error"); return;
    }

    setStep("encrypting");
    try {
      await registerProfile({
        age: parseInt(form.age),
        conditionCode: parseInt(form.conditionCode),
        biomarkerScore: parseInt(form.biomarkerScore),
        geographicRegion: parseInt(form.geographicRegion),
      });
      setStep("done");
      toast("Profile registered. Your health data is now encrypted on-chain.", "success");
    } catch (err: any) {
      toast(err.message || "Registration failed", "error");
      setStep("idle");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete your profile? This is permanent (GDPR right to erasure).")) return;
    try {
      await deleteProfile();
      toast("Profile deleted from chain.", "success");
      setStep("idle");
    } catch (err: any) {
      toast(err.message || "Deletion failed", "error");
    }
  };

  if (!wallet.connected) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⊕</div>
        <div className="t-heading" style={{ marginBottom: 8 }}>Patient Portal</div>
        <p className="t-caption" style={{ marginBottom: 24 }}>
          Connect your wallet to register an encrypted health profile.
        </p>
        <button className="btn btn-primary" onClick={wallet.connect}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Status banner */}
      {hasProfile ? (
        <div style={{
          padding: "12px 16px",
          background: "var(--bio-glow)",
          border: "1px solid var(--bio-dim)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="status-dot active" />
            <span style={{ fontSize: 12, color: "var(--bio-green)", fontWeight: 600 }}>
              Encrypted Profile Active
            </span>
            <span className="encrypted-value" style={{ marginLeft: 8 }}>Profile data: ENCRYPTED</span>
          </div>
          <button className="btn btn-danger" onClick={handleDelete} style={{ fontSize: 10, padding: "4px 12px" }}>
            Delete Profile
          </button>
        </div>
      ) : (
        <div style={{
          padding: "12px 16px",
          background: "rgba(240,165,0,0.05)",
          border: "1px solid var(--amber-dim)",
          borderRadius: "var(--radius-md)",
          marginBottom: 24,
        }}>
          <span className="status-dot inactive" />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>No profile registered</span>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <span className="panel-header-title">Register Encrypted Health Profile</span>
          <span className="badge badge-purple">FHE Protected</span>
        </div>
        <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Privacy notice */}
          <div style={{
            padding: "10px 14px",
            background: "var(--void)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            gap: 8,
          }}>
            <span style={{ color: "var(--encrypted)", fontSize: 14 }}>ℹ</span>
            <span className="t-caption">
              All fields are encrypted on your device before submission using Zama FHEVM.
              No plaintext health data ever leaves your browser or is readable on-chain.
            </span>
          </div>

          <div className="field">
            <label>Age (years)</label>
            <input
              type="number"
              placeholder="e.g. 42"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              min={18} max={120}
            />
          </div>

          <div className="field">
            <label>Condition (ICD-10 Code)</label>
            <select
              value={form.conditionCode}
              onChange={(e) => setForm({ ...form, conditionCode: e.target.value })}
            >
              <option value="">Select condition…</option>
              {ICD10_CONDITIONS.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <span className="t-caption">Encrypted numeric code stored — condition name never touches the chain</span>
          </div>

          <div className="field">
            <label>Biomarker Composite Score (0 – 1000)</label>
            <input
              type="number"
              placeholder="e.g. 750"
              value={form.biomarkerScore}
              onChange={(e) => setForm({ ...form, biomarkerScore: e.target.value })}
              min={0} max={1000}
            />
            <span className="t-caption">Composite index of lab biomarkers (PSA, CA-125, HbA1c, etc.)</span>
          </div>

          <div className="field">
            <label>Geographic Region (ISO Numeric)</label>
            <input
              type="number"
              placeholder="e.g. 404 = Kenya"
              value={form.geographicRegion}
              onChange={(e) => setForm({ ...form, geographicRegion: e.target.value })}
            />
          </div>

          {/* Encryption preview */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="t-label" style={{ width: "100%", marginBottom: 4 }}>Will be stored as:</span>
            {["euint32 age", "euint32 conditionCode", "euint32 biomarkerScore", "euint32 region"].map((f) => (
              <span key={f} className="encrypted-value">{f}</span>
            ))}
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              className="btn btn-encrypted"
              onClick={handleRegister}
              disabled={loading || step === "done"}
              style={{ flex: 1 }}
            >
              {step === "encrypting" ? (
                <><div className="spinner" /> Encrypting locally…</>
              ) : step === "submitting" ? (
                <><div className="spinner" /> Submitting to chain…</>
              ) : step === "done" ? (
                "✓ Profile Registered"
              ) : (
                <>⊕ Encrypt & Register Profile</>
              )}
            </button>
          </div>

          {step === "done" && (
            <div style={{
              padding: "12px",
              background: "var(--bio-glow)",
              border: "1px solid var(--bio-dim)",
              borderRadius: "var(--radius-sm)",
            }}>
              <span className="t-caption" style={{ color: "var(--bio-green)" }}>
                ✓ Your encrypted profile is live. Navigate to Trial Browser to request eligibility checks.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}