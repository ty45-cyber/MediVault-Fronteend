import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";

export interface WalletState {
  connected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useWallet(): WalletState {
  const [state, setState] = useState<Omit<WalletState, "connect" | "disconnect">>({
    connected: false,
    address: null,
    provider: null,
    signer: null,
    chainId: null,
  });

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Warn if not on Sepolia (11155111)
      if (chainId !== 11155111) {
        const shouldSwitch = confirm(
          `You're on chain ${chainId}. MediVault runs on Sepolia (11155111). Switch now?`
        );
        if (shouldSwitch) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // Sepolia
          });
        }
      }

      setState({ connected: true, address, provider, signer, chainId });
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ connected: false, address: null, provider: null, signer: null, chainId: null });
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnect();
      else setState((prev) => ({ ...prev, address: accounts[0] }));
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  }, [disconnect]);

  return { ...state, connect, disconnect };
}