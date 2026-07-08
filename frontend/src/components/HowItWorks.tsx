import React from "react";

export function HowItWorks() {
  const steps = [
    {
      id: "01",
      actor: "Patient",
      color: "var(--bio-green)",
      title: "Encrypt & Register Profile",
      description: "Your age, diagnosis code, biomarker score, and region are encrypted on your device using Zama's FHEVM SDK before leaving your browser. The encrypted ciphertexts are stored on-chain. Nobody — not the contract, not the sponsor, not Zama — can read your health data.",
      icon: "⊕",
      badge: "FHE Encrypted",
      badgeClass: "badge-purple",
    },
    {
      id: "02",
      actor: "Sponsor",
      color: "var(--amber)",
      title: "Post Encrypted Trial Criteria",
      description: "Pharmaceutical sponsors post clinical trial eligibility criteria (age range, condition codes, biomarker thresholds) also in encrypted form. Neither patients nor observers can reverse-engineer the trial's exact criteria. Sponsors see aggregate match counts only.",
      icon: "◈",
      badge: "Confidential Criteria",
      badgeClass: "badge-amber",
    },
    {
      id: "03",
      actor: "Smart Contract",
      color: "var(--encrypted)",
      title: "FHE Computation — The Magic",
      description: "The contract performs arithmetic comparisons directly on encrypted data using Fully Homomorphic Encryption. It computes age ≥ minAge, age ≤ maxAge, conditionCode == required, and biomarker in range — all while the values remain encrypted. No plaintext ever exists.",
      icon: "∿",
      badge: "On-Chain FHE",
      badgeClass: "badge-purple",
    },
    {
      id: "04",
      actor: "Patient",
      color: "var(--bio-green)",
      title: "Receive Encrypted Eligibility Token",
      description: "The result — an encrypted 1 (eligible) or 0 (not eligible) — is stored on-chain. Only you hold the private key to decrypt it via the Zama Gateway. No one else can learn whether you're eligible, yet the eligibility is cryptographically verifiable.",
      icon: "🗝",
      badge: "Patient-Only Access",
      badgeClass: "badge-green",
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "48px 24px 40px",
        borderBottom: "1px solid var(--border)",
        marginBottom: 40,
      }}>
        <div className="t-label" style={{ marginBottom: 12 }}>Powered by Zama FHEVM</div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          marginBottom: 16,
          fontFamily: "var(--font-mono)",
        }}>
          Your diagnosis.{" "}
          <span style={{ color: "var(--amber)" }}>Your secret.</span>
          <br />Cryptographically.
        </h1>
        <p style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          maxWidth: 580,
          margin: "0 auto",
          lineHeight: 1.7,
          fontFamily: "var(--font-sans)",
        }}>
          MediVault matches patients to clinical trials using Fully Homomorphic Encryption —
          the first protocol where eligibility is computed on encrypted health data, on-chain,
          with zero knowledge of the patient's condition by any party.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <span className="badge badge-purple">FHE-Native</span>
          <span className="badge badge-amber">HIPAA-Compatible by Design</span>
          <span className="badge badge-green">GDPR: Right to Erasure</span>
          <span className="badge badge-muted">Sepolia Testnet Live</span>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {steps.map((step) => (
          <div key={step.id} className="panel">
            <div className="panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: step.color,
                  fontFamily: "var(--font-mono)",
                  opacity: 0.6,
                }}>{step.id}</span>
                <span style={{ color: "var(--border-bright)" }}>—</span>
                <span className="panel-header-title" style={{ color: step.color }}>
                  {step.actor}
                </span>
                <span className="panel-header-title" style={{ color: "var(--text-primary)" }}>
                  · {step.title}
                </span>
              </div>
              <span className={`badge ${step.badgeClass}`}>{step.badge}</span>
            </div>
            <div className="panel-body" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                fontSize: 28,
                width: 48,
                height: 48,
                minWidth: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--void)",
                border: `1px solid ${step.color}20`,
                borderRadius: "var(--radius-md)",
                color: step.color,
              }}>
                {step.icon}
              </div>
              <p style={{
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
              }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Technical callout */}
      <div style={{
        marginTop: 32,
        padding: 24,
        background: "var(--encrypted-glow)",
        border: "1px solid rgba(139,68,255,0.3)",
        borderRadius: "var(--radius-md)",
      }}>
        <div className="t-label" style={{ color: "var(--encrypted)", marginBottom: 8 }}>
          Core FHE Operations in MediVault
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            "TFHE.ge(age, minAge)",
            "TFHE.le(age, maxAge)",
            "TFHE.eq(conditionCode, required)",
            "TFHE.ge(biomarker, minScore)",
            "TFHE.le(biomarker, maxScore)",
            "TFHE.and(…all conditions…)",
            "TFHE.select(eligible, 1, 0)",
            "TFHE.allow(result, patient)",
          ].map((op) => (
            <span key={op} style={{
              padding: "4px 10px",
              background: "var(--void)",
              border: "1px solid var(--border-bright)",
              borderRadius: "var(--radius-sm)",
              fontSize: 11,
              color: "var(--encrypted)",
              fontFamily: "var(--font-mono)",
            }}>{op}</span>
          ))}
        </div>
      </div>
    </div>
  );
}