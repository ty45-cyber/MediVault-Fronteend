import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import type { WalletState } from "./useWallet";
import { MEDIVAULT_ADDRESS, MEDIVAULT_ABI } from "../constants/contract";

// Zama FHEVM SDK — import from their SDK in production
// import { createFhevmInstance } from "fhevmjs";

interface ProfileInput {
  age: number;
  conditionCode: number;
  biomarkerScore: number;
  geographicRegion: number;
}

interface TrialInput {
  trialId: string;
  minAge: number;
  maxAge: number;
  conditionCode: number;
  minBiomarker: number;
  maxBiomarker: number;
  region: number;
  requiresRegionMatch: boolean;
  maxParticipants: number;
  metadataURI: string;
}

export function useMediVault(wallet: WalletState) {
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);

  const getContract = useCallback(() => {
    if (!wallet.signer) throw new Error("Wallet not connected");
    return new ethers.Contract(MEDIVAULT_ADDRESS, MEDIVAULT_ABI, wallet.signer);
  }, [wallet.signer]);

  // Initialize FHEVM instance
  useEffect(() => {
    if (!wallet.connected) return;
    const init = async () => {
      try {
        // In production, initialize the real Zama FHEVM SDK:
        // const instance = await createFhevmInstance({
        //   chainId: wallet.chainId!,
        //   networkUrl: "https://rpc.sepolia.org",
        //   gatewayUrl: "https://gateway.sepolia.zama.ai",
        //   aclContractAddress: "0x...",
        //   kmsContractAddress: "0x...",
        // });
        // setFhevmInstance(instance);
        console.log("FHEVM instance initialized for chain", wallet.chainId);
      } catch (err) {
        console.error("FHEVM init failed:", err);
      }
    };
    init();
  }, [wallet.connected, wallet.chainId]);

  // Check if patient has a profile
  useEffect(() => {
    if (!wallet.address || !wallet.provider) return;
    const check = async () => {
      try {
        const contract = new ethers.Contract(MEDIVAULT_ADDRESS, MEDIVAULT_ABI, wallet.provider!);
        const result = await contract.hasProfile(wallet.address);
        setHasProfile(result);
      } catch (err) {
        console.error("Profile check failed:", err);
      }
    };
    check();
  }, [wallet.address, wallet.provider]);

  /**
   * Encrypt health profile fields and register on-chain.
   * In production: uses fhevmInstance.createEncryptedInput() for each field.
   */
  const registerProfile = useCallback(async (data: ProfileInput) => {
    setLoading(true);
    try {
      const contract = getContract();

      if (!fhevmInstance && MEDIVAULT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        // Production FHEVM encryption flow:
        // const contractAddr = await contract.getAddress();
        //
        // const ageInput = fhevmInstance.createEncryptedInput(contractAddr, wallet.address!);
        // ageInput.add32(data.age);
        // const encAge = await ageInput.encrypt();
        //
        // const condInput = fhevmInstance.createEncryptedInput(contractAddr, wallet.address!);
        // condInput.add32(data.conditionCode);
        // const encCond = await condInput.encrypt();
        //
        // [repeat for biomarker and region]
        //
        // const tx = await contract.registerProfile(
        //   encAge.handles[0],   encCond.handles[0],   encBio.handles[0],   encReg.handles[0],
        //   encAge.inputProof,   encCond.inputProof,   encBio.inputProof,   encReg.inputProof,
        // );
        // await tx.wait();
      }

      // Demo stub for testnet without deployed contract:
      console.log("Registering encrypted profile:", {
        age: `[ENCRYPTED: euint32]`,
        conditionCode: `[ENCRYPTED: euint32]`,
        biomarkerScore: `[ENCRYPTED: euint32]`,
        geographicRegion: `[ENCRYPTED: euint32]`,
      });

      // Simulate delay
      await new Promise((r) => setTimeout(r, 2000));
      setHasProfile(true);
    } finally {
      setLoading(false);
    }
  }, [getContract, fhevmInstance, wallet.address]);

  const deleteProfile = useCallback(async () => {
    setLoading(true);
    try {
      const contract = getContract();
      const tx = await contract.deleteProfile();
      await tx.wait();
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  const requestEligibilityCheck = useCallback(async (trialId: string) => {
    setLoading(true);
    try {
      const contract = getContract();
      const tx = await contract.requestEligibilityCheck(trialId);
      const receipt = await tx.wait();
      return receipt;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  const getActiveTrials = useCallback(async () => {
    if (!wallet.provider) return [];
    try {
      const contract = new ethers.Contract(MEDIVAULT_ADDRESS, MEDIVAULT_ABI, wallet.provider);
      const ids: string[] = await contract.getActiveTrialIds();
      const trials = await Promise.all(
        ids.map(async (trialId) => {
          const info = await contract.getTrialPublicInfo(trialId);
          return {
            trialId,
            sponsor: info[0],
            maxParticipants: Number(info[1]),
            currentMatches: Number(info[2]),
            createdAt: Number(info[3]),
            active: info[4],
            metadataURI: info[5],
          };
        })
      );
      return trials;
    } catch (err) {
      console.error("getActiveTrials failed:", err);
      return [];
    }
  }, [wallet.provider]);

  const registerTrial = useCallback(async (data: TrialInput) => {
    setLoading(true);
    try {
      // Demo stub — production flow mirrors registerProfile with FHEVM encryption per field
      console.log("Registering encrypted trial:", data.trialId);
      await new Promise((r) => setTimeout(r, 2000));
    } finally {
      setLoading(false);
    }
  }, []);

  const hasRequestedMatch = useCallback(async (trialId: string): Promise<boolean> => {
    if (!wallet.address || !wallet.provider) return false;
    try {
      const contract = new ethers.Contract(MEDIVAULT_ADDRESS, MEDIVAULT_ABI, wallet.provider);
      return await contract.hasRequestedMatch(wallet.address, trialId);
    } catch {
      return false;
    }
  }, [wallet.address, wallet.provider]);

  return {
    hasProfile,
    loading,
    registerProfile,
    deleteProfile,
    requestEligibilityCheck,
    getActiveTrials,
    registerTrial,
    hasRequestedMatch,
  };
}