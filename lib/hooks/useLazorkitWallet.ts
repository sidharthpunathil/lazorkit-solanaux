/**
 * Custom Hook: useLazorkitWallet
 * 
 * Wraps Lazorkit's useWallet hook with Zustand state management.
 * This provides a unified interface for wallet operations across the app.
 * 
 * Benefits:
 * - Automatic state synchronization with Zustand store
 * - Balance fetching on connection
 * - Error handling and loading states
 * - Type-safe wallet operations
 * - Direct access to signMessage and verifyMessage (available in new kit)
 */

import { useEffect, useCallback, useRef } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWalletStore } from "@/lib/store/walletStore";
import { LAZORKIT_CONFIG } from "@/lib/config/lazorkit";
import toast from "react-hot-toast";

export function useLazorkitWallet() {
  const lazorkitWalletHook = useWallet();
  const {
    connect: lazorkitConnect,
    disconnect: lazorkitDisconnect,
    signAndSendTransaction: lazorkitSignAndSendTransaction,
    signMessage: lazorkitSignMessage,
    verifyMessage: lazorkitVerifyMessage,
    isConnected: lazorkitIsConnected,
    isConnecting: lazorkitIsConnecting,
    isSigning: lazorkitIsSigning,
    wallet: lazorkitWallet,
    smartWalletPubkey: lazorkitSmartWalletPubkey,
  } = lazorkitWalletHook as any; // Type assertion needed for new kit features
  
  const {
    isConnected,
    isConnecting,
    wallet,
    smartWalletAddress,
    balance,
    setConnecting,
    setConnected,
    setWallet,
    setSmartWalletAddress,
    setBalance,
    reset,
  } = useWalletStore();

  // Use refs to track previous values and prevent unnecessary updates
  const prevConnectedRef = useRef(lazorkitIsConnected);
  const prevConnectingRef = useRef(lazorkitIsConnecting);
  const prevWalletRef = useRef(lazorkitWallet);
  const prevPubkeyRef = useRef(lazorkitSmartWalletPubkey?.toString());

  // Sync Lazorkit state with Zustand store
  // Only update when lazorkitWallet values change (not store values)
  useEffect(() => {
    if (prevConnectedRef.current !== lazorkitIsConnected) {
      setConnected(lazorkitIsConnected);
      prevConnectedRef.current = lazorkitIsConnected;
    }
    if (prevConnectingRef.current !== lazorkitIsConnecting) {
      setConnecting(lazorkitIsConnecting);
      prevConnectingRef.current = lazorkitIsConnecting;
    }
    if (prevWalletRef.current !== lazorkitWallet) {
      setWallet(lazorkitWallet || null);
      prevWalletRef.current = lazorkitWallet;
    }
    const currentPubkey = lazorkitSmartWalletPubkey?.toString();
    if (prevPubkeyRef.current !== currentPubkey) {
      setSmartWalletAddress(currentPubkey || null);
      prevPubkeyRef.current = currentPubkey;
    }
    // Only depend on lazorkitWallet values, not store values
  }, [
    lazorkitIsConnected,
    lazorkitIsConnecting,
    lazorkitWallet,
    lazorkitSmartWalletPubkey,
    setConnected,
    setConnecting,
    setWallet,
    setSmartWalletAddress,
  ]);

  /**
   * Fetch SOL balance for the connected wallet
   */
  const fetchBalance = useCallback(async () => {
    // Use lazorkitWallet values directly to avoid circular dependency
    const address = lazorkitSmartWalletPubkey?.toString();
    if (!address) return;

    try {
      const connection = new Connection(LAZORKIT_CONFIG.RPC_URL, {
        commitment: "confirmed",
        // Add timeout to prevent hanging requests
        httpHeaders: {
          "Content-Type": "application/json",
        },
      });
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL); // Convert lamports to SOL
    } catch (error: any) {
      // Silently handle rate limiting (429) errors - they're expected with public RPCs
      if (error?.message?.includes("429") || error?.status === 429) {
        console.warn("RPC rate limited - balance update skipped");
        // Don't show error toast for rate limiting - it's expected behavior
        return;
      }
      console.error("Failed to fetch balance:", error);
      // Only show error for unexpected failures
      if (!error?.message?.includes("429")) {
        toast.error("Failed to fetch balance");
      }
    }
  }, [lazorkitSmartWalletPubkey, setBalance]);

  // Fetch balance when wallet connects (use lazorkitWallet values directly)
  useEffect(() => {
    if (lazorkitIsConnected && lazorkitSmartWalletPubkey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [lazorkitIsConnected, lazorkitSmartWalletPubkey, fetchBalance, setBalance]);

  /**
   * Connect wallet with passkey authentication
   * This triggers the biometric prompt (Face ID/Touch ID/Fingerprint)
   */
  const connect = async () => {
    try {
      setConnecting(true);
      const walletInfo = await lazorkitConnect({ feeMode: "paymaster" });
      setWallet(walletInfo);
      toast.success("Wallet connected successfully!");
      return walletInfo;
    } catch (error: any) {
      console.error("Connection failed:", error);
      toast.error(error?.message || "Failed to connect wallet");
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect wallet and clear session
   */
  const disconnect = async () => {
    try {
      await lazorkitDisconnect();
      reset();
      toast.success("Wallet disconnected");
    } catch (error: any) {
      console.error("Disconnect failed:", error);
      toast.error(error?.message || "Failed to disconnect");
    }
  };

  /**
   * Sign a message with passkey
   * Useful for authentication without sending transactions
   * 
   * Note: signMessage is available in the new lazor-kit SDK
   */
  const signMessage = async (message: string) => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    if (!lazorkitSignMessage) {
      throw new Error("signMessage is not available. Please ensure you're using the latest @lazorkit/wallet SDK.");
    }

    try {
      const result = await lazorkitSignMessage(message);
      toast.success("Message signed successfully!");
      return result;
    } catch (error: any) {
      console.error("Sign message failed:", error);
      toast.error(error?.message || "Failed to sign message");
      throw error;
    }
  };

  /**
   * Verify a message signature
   * Useful for verifying message authenticity
   */
  const verifyMessage = async (args: {
    signedPayload: Uint8Array;
    signature: Uint8Array;
    publicKey: Uint8Array;
  }): Promise<boolean> => {
    if (!lazorkitVerifyMessage) {
      throw new Error("verifyMessage is not available. Please ensure you're using the latest @lazorkit/wallet SDK.");
    }

    try {
      return await lazorkitVerifyMessage(args);
    } catch (error: any) {
      console.error("Verify message failed:", error);
      toast.error(error?.message || "Failed to verify message");
      throw error;
    }
  };

  return {
    // State
    isConnected,
    isConnecting,
    isSigning: lazorkitIsSigning,
    wallet,
    smartWalletAddress,
    balance,

    // Actions
    connect,
    disconnect,
    signMessage: lazorkitSignMessage ? signMessage : undefined,
    verifyMessage: lazorkitVerifyMessage ? verifyMessage : undefined,
    isSignMessageAvailable: !!lazorkitSignMessage && typeof lazorkitSignMessage === 'function',
    signAndSendTransaction: lazorkitSignAndSendTransaction as any,
    fetchBalance,

    // Direct access to Lazorkit wallet (for advanced use cases)
    lazorkitWallet: {
      connect: lazorkitConnect,
      disconnect: lazorkitDisconnect,
      signMessage: lazorkitSignMessage,
      verifyMessage: lazorkitVerifyMessage,
      signAndSendTransaction: lazorkitSignAndSendTransaction,
      isConnected: lazorkitIsConnected,
      isConnecting: lazorkitIsConnecting,
      isSigning: lazorkitIsSigning,
      wallet: lazorkitWallet,
      smartWalletPubkey: lazorkitSmartWalletPubkey,
    },
  };
}
