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
import { getLazorkitConfig } from "@/lib/config/lazorkit";
import toast from "react-hot-toast";

// Debounce utility to prevent too many rapid calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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
    network,
    setConnecting,
    setConnected,
    setWallet,
    setSmartWalletAddress,
    setBalance,
    reset,
  } = useWalletStore();
  
  // Get network-aware config
  const config = getLazorkitConfig(network);

  // Use refs to track previous values and prevent unnecessary updates
  const prevConnectedRef = useRef(lazorkitIsConnected);
  const prevConnectingRef = useRef(lazorkitIsConnecting);
  const prevWalletRef = useRef(lazorkitWallet);
  const prevPubkeyRef = useRef(lazorkitSmartWalletPubkey?.toString());
  const isFetchingBalanceRef = useRef(false);
  const lastBalanceFetchRef = useRef(0);
  const balanceErrorCountRef = useRef(0);

  // Initial sync on mount - ensure state is synced immediately after network switch
  useEffect(() => {
    // Sync immediately on mount to catch any existing connection state
    // This is especially important after network switches when the provider remounts
    setConnected(lazorkitIsConnected);
    setConnecting(lazorkitIsConnecting);
    if (lazorkitWallet) {
      setWallet(lazorkitWallet);
    }
    if (lazorkitSmartWalletPubkey) {
      setSmartWalletAddress(lazorkitSmartWalletPubkey.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - we want to capture initial state

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
   * Includes debouncing and error handling to prevent too many requests
   */
  const fetchBalance = useCallback(async () => {
    // Use lazorkitWallet values directly to avoid circular dependency
    const address = lazorkitSmartWalletPubkey?.toString();
    if (!address) return;

    // Prevent concurrent requests
    if (isFetchingBalanceRef.current) {
      return;
    }

    // Throttle: Don't fetch more than once every 3 seconds
    const now = Date.now();
    const timeSinceLastFetch = now - lastBalanceFetchRef.current;
    if (timeSinceLastFetch < 3000) {
      return;
    }

    isFetchingBalanceRef.current = true;
    lastBalanceFetchRef.current = now;

    try {
      // Get fresh config based on current network
      const currentConfig = getLazorkitConfig(network);
      const connection = new Connection(currentConfig.RPC_URL, {
        commitment: "confirmed",
        // Add timeout to prevent hanging requests
        httpHeaders: {
          "Content-Type": "application/json",
        },
      });
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL); // Convert lamports to SOL
      balanceErrorCountRef.current = 0; // Reset error count on success
    } catch (error: any) {
      // Silently handle rate limiting (429) errors - they're expected with public RPCs
      // Check multiple ways the error might be formatted
      const errorMessage = error?.message || "";
      const errorCode = error?.code || error?.error?.code;
      const errorStatus = error?.status;
      
      if (
        errorMessage.includes("429") ||
        errorCode === 429 ||
        errorStatus === 429 ||
        errorMessage.includes("Too many requests")
      ) {
        console.warn("RPC rate limited - balance update skipped");
        // Don't show error toast for rate limiting - it's expected behavior
        // Don't increment error count for rate limits
        return;
      }
      
      // Handle "Failed to fetch" errors (network issues)
      if (errorMessage.includes("Failed to fetch") || error?.name === "TypeError") {
        console.warn("Network error while fetching balance:", error);
        // Don't show error toast for network errors - they're temporary
        // Don't increment error count for network errors
        return;
      }
      
      console.error("Failed to fetch balance:", error);
      
      // Only show error toast occasionally (not for every failure)
      // Show error every 5th failure to avoid spam
      balanceErrorCountRef.current += 1;
      if (balanceErrorCountRef.current % 5 === 0) {
        toast.error("Failed to fetch balance. Check your connection.");
      }
    } finally {
      isFetchingBalanceRef.current = false;
    }
  }, [lazorkitSmartWalletPubkey, setBalance, network]);

  // Fetch balance when wallet connects (use lazorkitWallet values directly)
  // Use a debounced version to prevent too many rapid calls
  const debouncedFetchBalanceRef = useRef(
    debounce((address: string, currentNetwork: typeof network) => {
      if (lazorkitIsConnected && address) {
        fetchBalance();
      }
    }, 1000) // Debounce by 1 second
  );

  useEffect(() => {
    if (lazorkitIsConnected && lazorkitSmartWalletPubkey) {
      // Use debounced version to prevent rapid successive calls
      const address = lazorkitSmartWalletPubkey.toString();
      debouncedFetchBalanceRef.current(address, network);
    } else {
      setBalance(null);
      balanceErrorCountRef.current = 0; // Reset error count on disconnect
    }
    // Only depend on the actual values, not the function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazorkitIsConnected, lazorkitSmartWalletPubkey, network]);

  /**
   * Connect wallet with passkey authentication
   * This triggers the biometric prompt (Face ID/Touch ID/Fingerprint)
   * 
   * Note: According to Lazorkit docs, connect() only takes { feeMode } option.
   * The rpcUrl, portalUrl, and paymasterConfig are set in LazorkitProvider.
   */
  const connect = async () => {
    try {
      setConnecting(true);
      // Connect with feeMode only - config is set in LazorkitProvider
      const walletInfo = await lazorkitConnect({
        feeMode: "paymaster",
      });
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
