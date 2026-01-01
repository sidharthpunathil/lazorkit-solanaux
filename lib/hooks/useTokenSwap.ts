/**
 * Custom Hook: useTokenSwap
 * 
 * Integrates with Jupiter Aggregator API for token swaps on Solana.
 * Executes swaps gaslessly using Lazorkit.
 * 
 * Jupiter Aggregator:
 * - Finds the best swap route across all DEXs on Solana
 * - Supports all major tokens (SOL, USDC, USDT, etc.)
 * - Provides real-time quotes
 * - Handles complex multi-hop swaps automatically
 */

import { useState, useEffect } from "react";
import { useLazorkitWallet } from "./useLazorkitWallet";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { LAZORKIT_CONFIG, JUPITER_API_KEY, JUPITER_API_BASE_URL } from "@/lib/config/lazorkit";
import toast from "react-hot-toast";

import { useWalletStore, type Network } from "@/lib/store/walletStore";

// Token mints for different networks
export const TOKEN_MINTS = {
  devnet: {
    SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL (same on all networks)
    USDC: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Devnet USDT
  },
  mainnet: {
    SOL: "So11111111111111111111111111111111111111112", // Wrapped SOL
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Mainnet USDC
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Mainnet USDT
  },
} as const;

// Helper to get token mints for current network
export const getTokenMints = (network: Network) => TOKEN_MINTS[network];

interface SwapQuote {
  readonly inputMint: string;
  readonly outputMint: string;
  readonly inAmount: string;
  readonly outAmount: string;
  readonly priceImpactPct: number;
  readonly routePlan: any;
}

export function useTokenSwap() {
  const { signAndSendTransaction, smartWalletAddress, isConnected } =
    useLazorkitWallet();
  const network = useWalletStore((state) => state.network);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [lastSwapSignature, setLastSwapSignature] = useState<string | null>(null);

  /**
   * Fetch swap quote from Jupiter API
   */
  const fetchQuote = async (
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50 // 0.5% slippage
  ) => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    // Jupiter API only works on mainnet
    if (network === "devnet") {
      throw new Error("Jupiter API only works on Solana Mainnet, not Devnet. Please switch to Mainnet to use token swaps.");
    }

    setIsFetchingQuote(true);
    setQuote(null);

    try {
      // Convert amount to smallest unit (for SOL: lamports, for tokens: decimals)
      const inputMintPubkey = new PublicKey(inputMint);
      const tokenMints = getTokenMints(network);
      const isSOL = inputMint === tokenMints.SOL;
      const amountInSmallestUnit = isSOL
        ? amount * 1_000_000_000 // SOL has 9 decimals
        : amount * 1_000_000; // USDC/USDT have 6 decimals

      // Fetch quote from Jupiter API (new endpoint with API key)
      // Using https://api.jup.ag/swap/v1/quote (migrated from quote-api.jup.ag/v6)
      const quoteUrl = new URL(`${JUPITER_API_BASE_URL}/swap/v1/quote`);
      quoteUrl.searchParams.set("inputMint", inputMint);
      quoteUrl.searchParams.set("outputMint", outputMint);
      quoteUrl.searchParams.set("amount", amountInSmallestUnit.toString());
      quoteUrl.searchParams.set("slippageBps", slippageBps.toString());
      quoteUrl.searchParams.set("onlyDirectRoutes", "false"); // Allow multi-hop routes for better prices
      quoteUrl.searchParams.set("asLegacyTransaction", "false"); // Use versioned transactions (V0)
      quoteUrl.searchParams.set("restrictIntermediateTokens", "true"); // Use stable intermediate tokens to reduce slippage

      // Validate URL before fetching
      const urlString = quoteUrl.toString();
      console.log("Fetching Jupiter quote from:", urlString);
      
      // Prepare headers with API key
      const headers: HeadersInit = {
        "Accept": "application/json",
      };
      
      if (JUPITER_API_KEY) {
        headers["x-api-key"] = JUPITER_API_KEY;
      } else {
        console.warn("Jupiter API key not found. Some features may not work.");
      }
      
      let response: Response;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        response = await fetch(urlString, {
          method: "GET",
          headers,
          mode: "cors",
          signal: controller.signal,
        });

        if (timeoutId) clearTimeout(timeoutId);
      } catch (fetchError: any) {
        if (timeoutId) clearTimeout(timeoutId);
        
        // Handle different types of fetch errors
        if (fetchError.name === "AbortError") {
          throw new Error(
            "Request timeout: Jupiter API took too long to respond. Please try again."
          );
        }

        // Network error (connection failed, etc.)
        const errorMessage = fetchError?.message || "Failed to connect to Jupiter API";
        const errorName = fetchError?.name || "Unknown";
        
        console.error("Jupiter API fetch error:", {
          name: errorName,
          message: errorMessage,
          url: urlString,
          network,
          error: fetchError,
        });
        
        // Check if it's a server error (502/504 from our API route)
        if (errorMessage.includes("502") || errorMessage.includes("504")) {
          throw new Error(
            "Jupiter API is currently unavailable. This could be due to:\n" +
            "- Jupiter API server is down or experiencing issues\n" +
            "- Network connectivity problems\n" +
            "- Server-side firewall blocking the request\n\n" +
            "Please try again in a few moments or check Jupiter's status page."
          );
        }
        
        // Provide more helpful error messages
        if (
          errorMessage.includes("Failed to fetch") || 
          errorMessage.includes("NetworkError") ||
          errorName === "TypeError" ||
          errorMessage.includes("fetch failed")
        ) {
          throw new Error(
            "Network error: Unable to reach Jupiter API. This could be due to:\n" +
            "- Internet connection issues\n" +
            "- Jupiter API temporarily unavailable\n" +
            "- Server-side network configuration issues\n\n" +
            "Please check your connection and try again."
          );
        }
        
        throw new Error(
          `Network error: ${errorMessage}. Please check your internet connection and try again.`
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Jupiter API error (${response.status}): ${errorText || response.statusText}`
        );
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Failed to parse quote response from Jupiter API");
      }

      // Validate response structure
      if (!data || !data.inAmount || !data.outAmount) {
        throw new Error("Invalid quote response from Jupiter API");
      }

      setQuote({
        inputMint,
        outputMint,
        inAmount: data.inAmount,
        outAmount: data.outAmount,
        priceImpactPct: parseFloat(data.priceImpactPct || "0"),
        routePlan: data.routePlan,
      });

      return data;
    } catch (error: any) {
      console.error("Failed to fetch quote:", error);
      toast.error(error?.message || "Failed to fetch swap quote");
      throw error;
    } finally {
      setIsFetchingQuote(false);
    }
  };

  /**
   * Execute swap using Jupiter API
   */
  const executeSwap = async (
    inputMint: string,
    outputMint: string,
    amount: number
  ) => {
    if (!isConnected || !smartWalletAddress || !quote) {
      throw new Error("Wallet not connected or quote not available");
    }

    // Jupiter API only works on mainnet
    if (network === "devnet") {
      throw new Error("Jupiter API only works on Solana Mainnet, not Devnet. Please switch to Mainnet to use token swaps.");
    }

    setIsSwapping(true);
    setLastSwapSignature(null);

    try {
      const userPublicKey = new PublicKey(smartWalletAddress);

      // Get swap transaction from Jupiter API (new endpoint with API key)
      // Using https://api.jup.ag/swap/v1/swap (migrated from quote-api.jup.ag/v6)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const swapUrl = `${JUPITER_API_BASE_URL}/swap/v1/swap`;
      
      // Prepare headers with API key
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (JUPITER_API_KEY) {
        headers["x-api-key"] = JUPITER_API_KEY;
      } else {
        console.warn("Jupiter API key not found. Some features may not work.");
      }
      
      let response: Response;
      try {
        response = await fetch(swapUrl, {
          method: "POST",
          headers,
          mode: "cors",
          body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: smartWalletAddress,
            wrapAndUnwrapSol: true,
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: "auto", // Auto-calculate priority fee
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error("Request timeout: Swap transaction request took too long.");
        }
        throw new Error(
          `Network error: ${fetchError?.message || "Failed to get swap transaction"}`
        );
      }

      if (!response.ok) {
        throw new Error("Failed to get swap transaction");
      }

      const { swapTransaction } = await response.json();

      // Decode transaction
      const { Transaction } = await import("@solana/web3.js");
      const transaction = Transaction.from(
        Buffer.from(swapTransaction, "base64")
      );

      // Convert transaction instructions
      const instructions: TransactionInstruction[] = transaction.instructions;

      // Sign and send transaction gaslessly
      const signature = await (signAndSendTransaction as any)({
        instructions,
        transactionOptions: {
          feeToken: "USDC", // Pay fees in USDC
          computeUnitLimit: 1_400_000, // Jupiter swaps can be compute-intensive
        },
      });

      setLastSwapSignature(signature);
      toast.success(`Swap executed! Transaction: ${signature.slice(0, 8)}...`);

      return signature;
    } catch (error: any) {
      console.error("Swap failed:", error);
      toast.error(error?.message || "Swap failed");
      throw error;
    } finally {
      setIsSwapping(false);
    }
  };

  return {
    fetchQuote,
    executeSwap,
    isFetchingQuote,
    isSwapping,
    quote,
    lastSwapSignature,
  };
}

