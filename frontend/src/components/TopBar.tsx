import React from "react";
import type { WalletState } from "../hooks/useWallet";

interface Props { wallet: WalletState; }

export function TopBar({ wallet }: Props) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--void-2)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 32, height: 32,
          background: "var(--amber-glow)",
          border: "1px solid var(--amber)",
          borderRadius: "var(--radius-sm)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>⊕</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--amber)", letterSpacing: "-0.01em" }}>
            MEDIVAULT
          </div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Confidential Clinical Protocol
          </div>
        </div>
      </div>

      {/* Center marquee — live stats placeholder */}
      <div style={{ display: "flex", gap: 32 }} className="hide-mobile">
        {[
          { label: "ENCRYPTION", value: "FHE/TFHE", color: "var(--encrypted)" },
          { label: "CHAIN", value: "SEPOLIA", color: "var(--amber)" },
          { label: "PROTOCOL", value: "ZAMA FHEVM", color: "var(--bio-green)" },
          { label: "PRIVACY", value: "CRYPTOGRAPHIC", color: "var(--text-secondary)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div className="t-label">{label}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color, marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Wallet */}
      <div>
        {wallet.connected ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="status-dot active" />
            <span className="t-caption">
              {wallet.address?.slice(0, 6)}…{wallet.address?.slice(-4)}
            </span>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={wallet.connect}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}