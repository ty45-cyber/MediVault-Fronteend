import React, { useState, useEffect } from "react";
import type { WalletState } from "../hooks/useWallet";
import { useMediVault } from "../hooks/useMediVault";
import { useToast } from "../context/ToastContext";
import { ethers } from "ethers";

interface Props { wallet: WalletState; }

const EMPTY_FORM = {
  minAge: "", maxAge: "",
  conditionCode: "", minBiomarker: "", maxBiomarker: "",
  region: "0", requiresRegionMatch: false,
  maxParticipants: "100", metadataURI: "",
};

export function SponsorDashboard({ wallet }: Props) {
  const { toast } = useToast();
  const { registerTrial, getActiveTrials, loading } = useMediVault(wallet);
  const [form, setForm] = useState(EMPTY_FORM);
  const [myTrials, setMyTrials] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [step, setStep] = useState<"idle" | "encrypting" | "submitting" | "done">("idle");

  useEffect(() => {
    if (!wallet.connected || !wallet.address) return;
    setFetching(true);
    getActiveTrials()
      .then((all) => setMyTrials(all.filter((t: any) =>
        t.sponsor?.toLowerCase() === wallet.address?.toLowerCase()
      )))
      .catch(() => toast("Failed to load trials", "error"))
      .finally(() => setFetching(false));
  }, [wallet.connected, wallet.address]);

  const handleRegister = async () => {
    if (!wallet.connected) { toast("Connect your wallet first", "error"); return; }
    const { minAge, maxAge, conditionCode, minBiomarker, maxBiomarker, maxParticipants } = form;
    if (!minAge || !maxAge || !conditionCode || !minBiomarker || !maxBiomarker || !maxParticipants) {
      toast("All numeric fields are required", "error"); return;
    }
    setStep("encrypting");
    try {
      const trialId = ethers.id(`${wallet.address}-${Date.now()}`);
      await registerTrial({
        trialId,
        minAge: parseInt(minAge), maxAge: parseInt(maxAge),
        conditionCode: parseInt(conditionCode),
        minBiomarker: parseInt(minBiomarker), maxBiomarker: parseInt(maxBiomarker),
        region: parseInt(form.region),
        requiresRegionMatch: form.requiresRegionMatch,
        maxParticipants: parseInt(maxParticipants),
        metadataURI: form.metadataURI,
      });
      setStep("done");
      toast("Trial registered on-chain with encrypted criteria.", "success");
      setForm(EMPTY_FORM);
      setStep("idle");
    } catch (err: any) {
      toast(err.message || "Registration failed", "error");
      setStep("idle");
    }
  };

  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  if (!wallet.connected) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⊞</div>
        <div className="t-heading" style={{ marginBottom: 8 }}>Sponsor Dashboard</div>
        <p className="t-caption" style={{ marginBottom: 24 }}>
          Connect your wallet to register and manage clinical trials.
        </p>
        <button className="btn btn-primary" onClick={wallet.connect}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Register Trial */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-header-title">Register New Trial</span>
          <span className="badge badge-purple">FHE Protected</span>
        </div>
        <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{
            padding: "10px 14px", background: "var(--void)",
            border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
            display: "flex", gap: 8,
          }}>
            <span style={{ color: "var(--encrypted)", fontSize: 14 }}>ℹ</span>
            <span className="t-caption">
              Eligibility criteria are encrypted before submission. Patients are matched privately —
              you never see individual health data.
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label>Min Age</label>
              <input type="number" placeholder="18" value={form.minAge} onChange={set("minAge")} min={0} max={120} />
            </div>
            <div className="field">
              <label>Max Age</label>
              <input type="number" placeholder="75" value={form.maxAge} onChange={set("maxAge")} min={0} max={120} />
            </div>
            <div className="field">
              <label>Condition Code (ICD-10 numeric)</label>
              <input type="number" placeholder="e.g. 2500" value={form.conditionCode} onChange={set("conditionCode")} />
            </div>
            <div className="field">
              <label>Geographic Region (ISO numeric, 0 = any)</label>
              <input type="number" placeholder="0" value={form.region} onChange={set("region")} />
            </div>
            <div className="field">
              <label>Min Biomarker Score</label>
              <input type="number" placeholder="0" value={form.minBiomarker} onChange={set("minBiomarker")} min={0} max={1000} />
            </div>
            <div className="field">
              <label>Max Biomarker Score</label>
              <input type="number" placeholder="1000" value={form.maxBiomarker} onChange={set("maxBiomarker")} min={0} max={1000} />
            </div>
            <div className="field">
              <label>Max Participants</label>
              <input type="number" placeholder="100" value={form.maxParticipants} onChange={set("maxParticipants")} min={1} />
            </div>
            <div className="field" style={{ alignSelf: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.requiresRegionMatch}
                  onChange={set("requiresRegionMatch")}
                  style={{ width: "auto" }}
                />
                Require region match
              </label>
            </div>
          </div>

          <div className="field">
            <label>Metadata URI (IPFS / HTTPS)</label>
            <input type="text" placeholder="ipfs://… or https://…" value={form.metadataURI} onChange={set("metadataURI")} />
            <span className="t-caption">Public trial description — not encrypted</span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="t-label" style={{ width: "100%", marginBottom: 4 }}>Criteria stored as:</span>
            {["euint32 minAge", "euint32 maxAge", "euint32 condition", "euint32 minBiomarker", "euint32 maxBiomarker", "euint32 region"].map((f) => (
              <span key={f} className="encrypted-value">{f}</span>
            ))}
          </div>

          <button
            className="btn btn-encrypted"
            onClick={handleRegister}
            disabled={loading || step === "encrypting" || step === "submitting"}
            style={{ alignSelf: "flex-start", minWidth: 240 }}
          >
            {step === "encrypting" ? (
              <><div className="spinner" /> Encrypting criteria…</>
            ) : step === "submitting" ? (
              <><div className="spinner" /> Submitting to chain…</>
            ) : (
              <>⊕ Encrypt & Register Trial</>
            )}
          </button>
        </div>
      </div>

      {/* My Trials */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-header-title">My Trials</span>
          <span className="badge">{myTrials.length}</span>
        </div>
        <div className="panel-body">
          {fetching ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              <span className="t-caption">Loading…</span>
            </div>
          ) : myTrials.length === 0 ? (
            <span className="t-caption">No trials registered yet.</span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myTrials.map((trial) => (
                <div key={trial.trialId} style={{
                  padding: "12px 16px",
                  background: "var(--void)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div className="t-caption" style={{ fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                      {(trial.trialId as string).slice(0, 20)}…
                    </div>
                    <span className="t-caption">
                      {trial.currentMatches ?? 0} / {trial.maxParticipants ?? "∞"} matched
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {trial.active
                      ? <span className="badge badge-green">Active</span>
                      : <span className="badge">Inactive</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
