/**
 * Custom Hook: useGaslessTransfer
 * 
 * Handles gasless token transfers using Lazorkit's paymaster.
 * Users can send SOL or SPL tokens without holding SOL for fees.
 * 
 * Key Features:
 * - Gasless SOL transfers
 * - Gasless SPL token transfers (e.g., USDC)
 * - Automatic fee payment via paymaster
 * - Transaction status tracking
 */

import { useState } from "react";
import { useLazorkitWallet } from "./useLazorkitWallet";
import {
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { LAZORKIT_CONFIG, DEVNET_USDC_MINT } from "@/lib/config/lazorkit";
import toast from "react-hot-toast";

interface TransferOptions {
  readonly recipient: string;
  readonly amount: number; // Amount in SOL or token units
  readonly tokenMint?: string; // Optional: SPL token mint address (defaults to SOL)
  readonly feeToken?: "SOL" | "USDC"; // Token to pay fees with
}

export function useGaslessTransfer() {
  const { signAndSendTransaction, smartWalletAddress, isConnected } =
    useLazorkitWallet();
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  /**
   * Transfer SOL gaslessly
   */
  const transferSOL = async (options: TransferOptions) => {
    if (!isConnected || !smartWalletAddress) {
      throw new Error("Wallet not connected");
    }

    setIsTransferring(true);
    setLastSignature(null);

    try {
      const recipientPubkey = new PublicKey(options.recipient);
      const senderPubkey = new PublicKey(smartWalletAddress);
      const amountLamports = options.amount * LAMPORTS_PER_SOL;

      // Create transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports: amountLamports,
      });

      // Sign and send transaction with gasless option
      const signature = await (signAndSendTransaction as any)({
        instructions: [instruction],
        transactionOptions: {
          // Pay fees with USDC if specified, otherwise use default (SOL)
          feeToken: options.feeToken === "USDC" ? "USDC" : undefined,
        },
      });

      setLastSignature(signature);
      toast.success(
        `Successfully sent ${options.amount} SOL! Transaction: ${signature.slice(0, 8)}...`
      );

      return signature;
    } catch (error: any) {
      console.error("Transfer failed:", error);
      toast.error(error?.message || "Transfer failed");
      throw error;
    } finally {
      setIsTransferring(false);
    }
  };

  /**
   * Transfer SPL tokens (e.g., USDC) gaslessly
   */
  const transferToken = async (options: TransferOptions) => {
    if (!isConnected || !smartWalletAddress) {
      throw new Error("Wallet not connected");
    }

    setIsTransferring(true);
    setLastSignature(null);

    try {
      const connection = new Connection(LAZORKIT_CONFIG.RPC_URL, {
        commitment: "confirmed",
      });
      const tokenMint = new PublicKey(
        options.tokenMint || DEVNET_USDC_MINT
      );
      const senderPubkey = new PublicKey(smartWalletAddress);
      const recipientPubkey = new PublicKey(options.recipient);

      // Get associated token addresses
      const senderATA = await getAssociatedTokenAddress(
        tokenMint,
        senderPubkey
      );
      const recipientATA = await getAssociatedTokenAddress(
        tokenMint,
        recipientPubkey
      );

      // Check if recipient has token account, create if needed
      let instructions: TransactionInstruction[] = [];
      try {
        await getAccount(connection, recipientATA);
      } catch {
        // Recipient doesn't have token account, create it
        const {
          getAssociatedTokenAddressSync,
          createAssociatedTokenAccountInstruction,
        } = await import("@solana/spl-token");
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          senderPubkey,
          recipientATA,
          recipientPubkey,
          tokenMint
        );
        instructions.push(createATAInstruction);
      }

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        senderATA,
        recipientATA,
        senderPubkey,
        options.amount * 1_000_000, // USDC has 6 decimals
        []
      );
      instructions.push(transferInstruction);

      // Sign and send transaction gaslessly
      const signature = await (signAndSendTransaction as any)({
        instructions,
        transactionOptions: {
          feeToken: options.feeToken || "USDC", // Pay fees with USDC
        },
      });

      setLastSignature(signature);
      toast.success(
        `Successfully sent ${options.amount} tokens! Transaction: ${signature.slice(0, 8)}...`
      );

      return signature;
    } catch (error: any) {
      console.error("Token transfer failed:", error);
      toast.error(error?.message || "Token transfer failed");
      throw error;
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transferSOL,
    transferToken,
    isTransferring,
    lastSignature,
  };
}

