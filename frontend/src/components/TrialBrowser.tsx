import React, { useState, useEffect } from "react";
import type { WalletState } from "../hooks/useWallet";
import { useMediVault } from "../hooks/useMediVault";
import { useToast } from "../context/ToastContext";

interface Props { wallet: WalletState; }

export function TrialBrowser({ wallet }: Props) {
  const { toast } = useToast();
  const { getActiveTrials, requestEligibilityCheck, hasRequestedMatch, loading } = useMediVault(wallet);
  const [trials, setTrials] = useState<any[]>([]);
  const [requested, setRequested] = useState<Record<string, boolean>>({});
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!wallet.connected) return;
    setFetching(true);
    getActiveTrials()
      .then(setTrials)
      .catch(() => toast("Failed to load trials", "error"))
      .finally(() => setFetching(false));
  }, [wallet.connected]);

  const handleRequest = async (trialId: string) => {
    try {
      await requestEligibilityCheck(trialId);
      setRequested((prev) => ({ ...prev, [trialId]: true }));
      toast("Eligibility check requested. FHE matching in progress.", "success");
    } catch (err: any) {
      toast(err.message || "Request failed", "error");
    }
  };

  if (!wallet.connected) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⊗</div>
        <div className="t-heading" style={{ marginBottom: 8 }}>Trial Browser</div>
        <p className="t-caption" style={{ marginBottom: 24 }}>
          Connect your wallet to browse active clinical trials and request eligibility checks.
        </p>
        <button className="btn btn-primary" onClick={wallet.connect}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div className="t-heading">Active Clinical Trials</div>
          <p className="t-caption" style={{ marginTop: 4 }}>
            Eligibility is checked privately via FHE — sponsors never see your health data.
          </p>
        </div>
        <span className="badge badge-purple">{trials.length} Active</span>
      </div>

      {fetching ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          <span className="t-caption">Loading trials from chain…</span>
        </div>
      ) : trials.length === 0 ? (
        <div className="panel">
          <div className="panel-body" style={{ textAlign: "center", padding: 48 }}>
            <span className="t-caption">No active trials found on-chain.</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {trials.map((trial) => {
            const id = trial.trialId as string;
            const alreadyRequested = requested[id] || trial.hasRequested;
            return (
              <div key={id} className="panel">
                <div className="panel-header">
                  <span className="panel-header-title" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {id.slice(0, 18)}…
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {trial.active
                      ? <span className="badge badge-green">Active</span>
                      : <span className="badge">Inactive</span>}
                  </div>
                </div>
                <div className="panel-body">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <div className="t-label">Sponsor</div>
                      <div className="t-caption" style={{ fontFamily: "var(--font-mono)" }}>
                        {trial.sponsor ? `${trial.sponsor.slice(0, 8)}…${trial.sponsor.slice(-6)}` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="t-label">Participants</div>
                      <div className="t-caption">
                        {trial.currentMatches ?? 0} / {trial.maxParticipants ?? "∞"}
                      </div>
                    </div>
                    <div>
                      <div className="t-label">Criteria</div>
                      <span className="encrypted-value">ENCRYPTED</span>
                    </div>
                  </div>

                  {trial.metadataURI && (
                    <div style={{ marginBottom: 16 }}>
                      <div className="t-label" style={{ marginBottom: 4 }}>Metadata</div>
                      <a
                        href={trial.metadataURI}
                        target="_blank"
                        rel="noreferrer"
                        className="t-caption"
                        style={{ color: "var(--amber)", textDecoration: "none" }}
                      >
                        {trial.metadataURI}
                      </a>
                    </div>
                  )}

                  <button
                    className="btn btn-encrypted"
                    onClick={() => handleRequest(id)}
                    disabled={loading || alreadyRequested || !trial.active}
                    style={{ minWidth: 220 }}
                  >
                    {alreadyRequested ? "✓ Check Requested" : "⊕ Request Eligibility Check"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
