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

import { useState, useEffect, useRef } from "react";
import { useLazorkitWallet } from "./useLazorkitWallet";
import {
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import { Connection } from "@solana/web3.js";
import { getLazorkitConfig, DEVNET_USDC_MINT, MAINNET_USDC_MINT } from "@/lib/config/lazorkit";
import { useWalletStore } from "@/lib/store/walletStore";
import toast from "react-hot-toast";

/**
 * Helper function to get fresh blockhash from server
 * This ensures we have the latest blockhash before retrying transactions
 */
async function getFreshBlockhash(network: "devnet" | "mainnet"): Promise<void> {
  try {
    const response = await fetch(`/api/blockhash?network=${network}`);
    if (!response.ok) {
      console.warn("Failed to get fresh blockhash from server, continuing anyway");
      return;
    }
    const data = await response.json();
    if (data.success) {
      console.log("Got fresh blockhash from server:", data.blockhash.slice(0, 8) + "...");
    }
  } catch (error) {
    // Silently fail - this is just an optimization
    console.warn("Error getting fresh blockhash:", error);
  }
}

interface TransferOptions {
  readonly recipient: string;
  readonly amount: number; // Amount in SOL or token units
  readonly tokenMint?: string; // Optional: SPL token mint address (defaults to SOL)
  readonly feeToken?: "SOL" | "USDC"; // Token to pay fees with
}

export function useGaslessTransfer() {
  const { signAndSendTransaction, smartWalletAddress, isConnected, lazorkitWallet } =
    useLazorkitWallet();
  const network = useWalletStore((state) => state.network);
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<{
    signature: string;
    type: "SOL" | "USDC";
    amount: number;
    recipient: string;
    network: "devnet" | "mainnet";
  } | null>(null);
  
  // According to Lazorkit docs, wallet.smartWallet is the actual Solana address (Base58)
  // Use this as the primary source, with fallbacks
  const walletSmartWallet = lazorkitWallet?.wallet?.smartWallet;
  const smartWalletPubkey = lazorkitWallet?.smartWalletPubkey;
  
  // Priority: Use PublicKey directly if available, otherwise use wallet.smartWallet string
  // smartWalletPubkey is already a PublicKey object, which is preferred
  let effectiveSenderPubkey: PublicKey | null = null;
  let effectiveWalletAddress: string | null = null;
  
  if (smartWalletPubkey) {
    // Use PublicKey directly - this is the most reliable
    // This is the Passkey Wallet (smart wallet) address
    effectiveSenderPubkey = smartWalletPubkey;
    effectiveWalletAddress = smartWalletPubkey.toBase58();
  } else if (walletSmartWallet) {
    // Fallback to wallet.smartWallet string
    effectiveWalletAddress = walletSmartWallet;
    try {
      effectiveSenderPubkey = new PublicKey(walletSmartWallet);
    } catch (e) {
      // Only log errors, not every successful initialization
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to create PublicKey from wallet.smartWallet:", e);
      }
    }
  } else if (smartWalletAddress) {
    // Fallback to store's smartWalletAddress
    effectiveWalletAddress = smartWalletAddress;
    try {
      effectiveSenderPubkey = new PublicKey(smartWalletAddress);
    } catch (e) {
      // Only log errors, not every successful initialization
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to create PublicKey from smartWalletAddress:", e);
      }
    }
  }
  
  // Only log validation warnings if there's an actual issue (not on every render)
  // Use ref to track if we've already logged to avoid spam
  const hasLoggedWarningRef = useRef(false);
  useEffect(() => {
    if (isConnected && (!effectiveWalletAddress || !effectiveSenderPubkey) && !hasLoggedWarningRef.current) {
      // Only log warning once when the issue is detected
      console.warn("Passkey Wallet address not yet available, but wallet is connected. This may resolve after wallet initialization.");
      hasLoggedWarningRef.current = true;
    } else if (effectiveWalletAddress && effectiveSenderPubkey) {
      // Reset the flag if address becomes available
      hasLoggedWarningRef.current = false;
    }
  }, [isConnected, effectiveWalletAddress, effectiveSenderPubkey]);

  /**
   * Transfer SOL gaslessly
   */
  const transferSOL = async (options: TransferOptions) => {
    if (!isConnected) {
      throw new Error("Wallet not connected. Please connect your Passkey Wallet first.");
    }
    
    // Validate that we have the smart wallet address (Passkey Wallet)
    // Try to get it one more time in case it wasn't available on initial render
    let currentEffectiveWalletAddress = effectiveWalletAddress;
    let currentEffectiveSenderPubkey = effectiveSenderPubkey;
    
    if (!currentEffectiveWalletAddress || !currentEffectiveSenderPubkey) {
      const retrySmartWalletPubkey = lazorkitWallet?.smartWalletPubkey;
      const retryWalletSmartWallet = lazorkitWallet?.wallet?.smartWallet;
      const retrySmartWalletAddress = smartWalletAddress;
      
      if (retrySmartWalletPubkey) {
        currentEffectiveSenderPubkey = retrySmartWalletPubkey;
        currentEffectiveWalletAddress = retrySmartWalletPubkey.toBase58();
      } else if (retryWalletSmartWallet) {
        currentEffectiveWalletAddress = retryWalletSmartWallet;
        try {
          currentEffectiveSenderPubkey = new PublicKey(retryWalletSmartWallet);
        } catch (e) {
          // Will throw below
        }
      } else if (retrySmartWalletAddress) {
        currentEffectiveWalletAddress = retrySmartWalletAddress;
        try {
          currentEffectiveSenderPubkey = new PublicKey(retrySmartWalletAddress);
        } catch (e) {
          // Will throw below
        }
      }
      
      // If still not available, throw error
      if (!currentEffectiveWalletAddress || !currentEffectiveSenderPubkey) {
        throw new Error(
          "Passkey Wallet (smart wallet) address not available. " +
          "Please ensure your wallet is fully connected and try again. " +
          "If the issue persists, try disconnecting and reconnecting your wallet."
        );
      }
    }

    setIsTransferring(true);
    setLastSignature(null);
    setLastTransaction(null);

    try {
      // Validate recipient address
      if (!options.recipient || options.recipient.trim() === "") {
        throw new Error("Recipient address is required");
      }

      let recipientPubkey: PublicKey;
      let recipientAddress: string;
      try {
        recipientPubkey = new PublicKey(options.recipient.trim());
        recipientAddress = recipientPubkey.toBase58();
        
        // Verify it's a valid on-curve address (required for SOL transfers)
        if (!PublicKey.isOnCurve(recipientPubkey)) {
          throw new Error("Recipient address is not a valid on-curve Solana address. SOL can only be sent to on-curve addresses.");
        }
      } catch (error: any) {
        if (error.message?.includes("on-curve")) {
          throw error; // Re-throw on-curve errors as-is
        }
        throw new Error(`Invalid recipient address: ${options.recipient}. ${error.message}`);
      }

      // Prevent sending to yourself
      if (recipientAddress === effectiveWalletAddress) {
        throw new Error("Cannot send SOL to your own address. Please use a different recipient address.");
      }

      // Ensure we use the smart wallet (passkey wallet) as the sender
      // This is critical - the source must be the Passkey Wallet for gasless transactions
      if (!effectiveSenderPubkey) {
        throw new Error("Smart wallet (Passkey Wallet) address not available. Please reconnect your wallet.");
      }
      
      const senderPubkey = effectiveSenderPubkey; // Use the smart wallet directly
      const amountLamports = options.amount * LAMPORTS_PER_SOL;
      
      // Validate sender is the smart wallet
      if (senderPubkey.toBase58() !== currentEffectiveWalletAddress) {
        console.warn("Sender pubkey mismatch:", {
          senderPubkey: senderPubkey.toBase58(),
          currentEffectiveWalletAddress,
        });
      }
      
      // Log sender/recipient for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log("=== SOL Transfer Addresses ===");
        console.log("Sender (Smart Wallet/Passkey Wallet):", senderPubkey.toBase58());
        console.log("Recipient:", recipientPubkey.toBase58());
        console.log("Recipient from options:", options.recipient);
      }

      // Validate amount
      if (options.amount <= 0 || !isFinite(options.amount)) {
        throw new Error("Amount must be greater than 0");
      }

      // Check if recipient account exists (optional check - not required for SOL transfers)
      // This helps avoid simulation errors in the portal
      const config = getLazorkitConfig(network);
      const connection = new Connection(config.RPC_URL, { commitment: "confirmed" });
      let accountExists = false;
      try {
        const accountInfo = await connection.getAccountInfo(recipientPubkey, "confirmed");
        accountExists = accountInfo !== null && (accountInfo.lamports ?? 0) > 0;
        if (accountExists && accountInfo && process.env.NODE_ENV === 'development') {
          console.log(`Recipient account exists with ${accountInfo.lamports / LAMPORTS_PER_SOL} SOL`);
        }
      } catch (error: any) {
        // Account doesn't exist or RPC error - log but don't fail
        console.warn("Could not check recipient account:", error?.message);
        accountExists = false;
      }

      // Create transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports: amountLamports,
      });

      // Validate instruction before logging
      // For SOL transfers, the source MUST be the Passkey Wallet (smart wallet)
      if (senderPubkey.toBase58() !== effectiveWalletAddress) {
        throw new Error(
          `Invalid sender address. Expected Passkey Wallet (${effectiveWalletAddress}), ` +
          `but got ${senderPubkey.toBase58()}. Please reconnect your wallet.`
        );
      }
      
      // Validate recipient is not a token mint address
      const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
      const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
      const recipientAddressStr = recipientPubkey.toBase58();
      if (recipientAddressStr === USDC_MINT_MAINNET || recipientAddressStr === USDC_MINT_DEVNET) {
        throw new Error(
          `Invalid recipient address: "${recipientAddressStr}" is a token mint address, not a wallet address. ` +
          `You cannot send SOL to a token mint. Please enter a valid Solana wallet address (starts with a letter, 32-44 characters).`
        );
      }
      
      // Log instruction details for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log("=== Transfer Instruction Details ===");
        console.log("Instruction Program ID:", instruction.programId.toBase58());
        console.log("Instruction Keys:", instruction.keys.map(k => ({
          pubkey: k.pubkey.toBase58(),
          isSigner: k.isSigner,
          isWritable: k.isWritable,
        })));
        console.log("Instruction Data Length:", instruction.data.length);
        console.log("From (Sender - Passkey Wallet):", senderPubkey.toBase58());
        console.log("To (Recipient):", recipientPubkey.toBase58());
        console.log("Amount (lamports):", amountLamports);
        console.log("Amount (SOL):", options.amount);
      }
      
      // Validate the instruction keys match what we expect
      if (instruction.keys.length < 2) {
        throw new Error("Invalid instruction: Expected at least 2 keys (sender and recipient)");
      }
      if (instruction.keys[0].pubkey.toBase58() !== senderPubkey.toBase58()) {
        throw new Error(
          `Instruction key mismatch: First key should be sender (${senderPubkey.toBase58()}), ` +
          `but got ${instruction.keys[0].pubkey.toBase58()}`
        );
      }
      if (instruction.keys[1].pubkey.toBase58() !== recipientPubkey.toBase58()) {
        throw new Error(
          `Instruction key mismatch: Second key should be recipient (${recipientPubkey.toBase58()}), ` +
          `but got ${instruction.keys[1].pubkey.toBase58()}`
        );
      }

      // Get fresh blockhash from server before first attempt (helps prevent TransactionTooOld errors)
      await getFreshBlockhash(network);
      
      // Log RPC URL being used (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using RPC: ${config.RPC_URL.includes('helius') ? 'Helius' : 'Public'} - ${config.RPC_URL.split('?')[0]}`);
      }

      // Sign and send transaction with gasless option
      // Retry logic for TransactionTooOld errors (can happen if user takes too long to sign)
      let signature: string | undefined;
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          const transactionOptions = {
            // Pay fees with USDC if specified, otherwise use default (SOL)
            feeToken: options.feeToken === "USDC" ? "USDC" : undefined,
            // Only enable simulation if account exists - avoids portal simulation errors for new accounts
            // On Solana, accounts are created automatically when SOL is sent, so simulation isn't critical
            clusterSimulation: accountExists ? (network === "devnet" ? "devnet" : "mainnet") : undefined,
          };
          
          const payload = {
            instructions: [instruction],
            transactionOptions,
          };
          
          // Log transaction options for debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.log("=== Transaction Options ===");
            console.log("Fee Token:", transactionOptions.feeToken || "SOL (default)");
            console.log("Cluster Simulation:", transactionOptions.clusterSimulation || "disabled");
            console.log("Network:", network);
            console.log("Account Exists:", accountExists);
            console.log("Retry Attempt:", retries + 1, "/", maxRetries + 1);
            console.log("=== Full Payload to signAndSendTransaction ===");
            console.log(JSON.stringify({
              instructions: [{
                programId: instruction.programId.toBase58(),
                keys: instruction.keys.map(k => ({
                  pubkey: k.pubkey.toBase58(),
                  isSigner: k.isSigner,
                  isWritable: k.isWritable,
                })),
                dataLength: instruction.data.length,
              }],
              transactionOptions,
            }, null, 2));
          }
          
          signature = await (signAndSendTransaction as any)(payload);
          break; // Success, exit retry loop
        } catch (error: any) {
          const errorMessage = error?.message || "";
          const errorCode = error?.code || "";
          
          // Check if it's a TransactionTooOld error (0x1783 = 6019)
          // This can happen during CreateChunk if the user takes too long to sign
          // The Paymaster already retries 3 times, so if we get this error, we need to wait longer
          const isTransactionTooOld = 
            errorMessage.includes("TransactionTooOld") ||
            errorMessage.includes("Transaction is too old") ||
            errorMessage.includes("0x1783") ||
            errorCode === 6019 ||
            errorMessage.includes("6019");
          
          // Check if error is from CreateChunk (happens during chunk creation)
          // The error log shows "Instruction: CreateChunk" when this happens
          const errorStack = error?.stack || "";
          const isCreateChunkError = 
            errorMessage.includes("CreateChunk") ||
            errorMessage.includes("Instruction: CreateChunk") ||
            errorStack.includes("CreateChunk");
          
          if (isTransactionTooOld && retries < maxRetries) {
            retries++;
            
            // If Paymaster already retried (error message mentions "All retry attempts failed"),
            // or if it's a CreateChunk error, wait longer to ensure fresh blockhash
            const paymasterRetried = errorMessage.includes("All retry attempts failed") ||
                                   errorMessage.includes("All sign retry attempts failed");
            
            // Wait longer for CreateChunk errors or if Paymaster already retried
            // This gives time for blockhash to refresh and ensures fresh transaction
            // Devnet blockhashes expire faster, so wait longer
            const waitTime = (isCreateChunkError || paymasterRetried) 
              ? (network === "devnet" ? 3000 : 2000) // 3s devnet, 2s mainnet
              : 1000; // 1s for regular TransactionTooOld
            
            console.warn(
              `TransactionTooOld error${isCreateChunkError ? " during CreateChunk" : ""}${paymasterRetried ? " (Paymaster already retried)" : ""}, ` +
              `waiting ${waitTime}ms and retrying (${retries}/${maxRetries})...`
            );
            toast.error(
              `Transaction expired${isCreateChunkError ? " during creation" : ""}. ` +
              `Retrying... (${retries}/${maxRetries})`
            );
            
            // Get fresh blockhash from server before retrying (helps ensure RPC is ready)
            await getFreshBlockhash(network);
            
            // Wait for blockhash to refresh
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // Check for account-related errors
          // Note: The error might be about the recipient OR another account in the transaction
          const isAccountNotFound = 
            errorMessage.includes("Account does not exist") ||
            errorMessage.includes("has no data") ||
            errorMessage.includes("could not find account");
          
          if (isAccountNotFound) {
            // Extract account address from error message if present
            const addressMatch = errorMessage.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
            const errorAccountAddress = addressMatch ? addressMatch[0] : null;
            
            // Check if error is about the recipient
            const errorIsAboutRecipient = errorAccountAddress === recipientAddress || 
                                         errorMessage.includes(recipientAddress) ||
                                         errorMessage.includes(options.recipient);
            
            if (errorIsAboutRecipient) {
              // Error is about the recipient account
              if (accountExists) {
                // Account exists but portal simulation is failing
                // This could be due to:
                // 1. Network mismatch (account on different network)
                // 2. RPC issues
                // 3. Portal simulation being too strict
                
                console.error("Account exists but simulation failing:", {
                  recipient: options.recipient,
                  network,
                  accountExists,
                  error: errorMessage
                });
                
                // Try retrying without simulation - might work
                if (retries < maxRetries) {
                  retries++;
                  console.warn(`Retrying transaction (${retries}/${maxRetries}) - trying without simulation`);
                  
                  // Try without clusterSimulation to bypass portal simulation
                  try {
                    signature = await (signAndSendTransaction as any)({
                      instructions: [instruction],
                      transactionOptions: {
                        feeToken: options.feeToken === "USDC" ? "USDC" : undefined,
                        // Don't pass clusterSimulation - let portal decide or skip simulation
                      },
                    });
                    break; // Success!
                  } catch (retryError: any) {
                    // If retry without simulation also fails, continue to next retry
                    console.warn("Retry without simulation also failed:", retryError?.message);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                  }
                }
                
                // If all retries failed
                throw new Error(
                  `Transaction failed: Account "${options.recipient}" exists but portal simulation is failing. ` +
                  `This might be due to:\n` +
                  `- Network mismatch (account might be on ${network === "devnet" ? "mainnet" : "devnet"})\n` +
                  `- RPC endpoint issues\n` +
                  `- Portal simulation service issues\n\n` +
                  `Please verify you're on the correct network (${network}) and try again.`
                );
              } else {
                // Recipient doesn't exist - portal blocks new accounts
                if (retries < maxRetries) {
                  retries++;
                  console.warn(`Account not found (attempt ${retries}/${maxRetries}) - trying without simulation`);
                  
                  // Try without simulation as last resort
                  try {
                    signature = await (signAndSendTransaction as any)({
                      instructions: [instruction],
                      transactionOptions: {
                        feeToken: options.feeToken === "USDC" ? "USDC" : undefined,
                        // Don't pass clusterSimulation
        },
      });
                    break; // Success!
                  } catch (retryError: any) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                  }
                }
                
                throw new Error(
                  `Transaction blocked: The recipient account "${options.recipient}" does not exist yet. ` +
                  `On Solana, accounts are created automatically when SOL is sent, but the portal's simulation requires the account to exist first. ` +
                  `\n\nWorkarounds:\n` +
                  `1. Send to an address that already has a balance\n` +
                  `2. Fund the recipient address with a small amount first\n` +
                  `3. Use a different recipient address that already exists`
                );
              }
            } else {
              // Error is about a different account (not the recipient)
              // This could be:
              // 1. The chunk account (internal SDK account) - timing/indexing issue
              // 2. The sender's smart wallet - connection issue
              // 3. Another account in the transaction
              
              // Check if this is a chunk account error by looking at the stack trace
              // The error happens in fetchChunkContext -> buildExecuteChunkIns -> executeChunkTxn
              const errorStack = error?.stack || "";
              const isChunkAccountError = 
                errorMessage.includes("chunk") || 
                errorMessage.includes("Chunk") ||
                errorStack.includes("fetchChunkContext") ||
                errorStack.includes("buildExecuteChunkIns") ||
                errorStack.includes("executeChunkTxn") ||
                errorStack.includes("lazorkit.ts:162") || // fetchChunkContext line
                errorStack.includes("lazorkit.ts:593") || // buildExecuteChunkIns line
                errorStack.includes("lazorkit.ts:879");   // executeChunkTxn line
              
              console.warn("Account error, but not about recipient:", {
                errorMessage,
                errorAccount: errorAccountAddress,
                recipient: options.recipient,
                isChunkAccountError,
                hasChunkInStack: errorStack.includes("chunk")
              });
              
              if (isChunkAccountError && errorAccountAddress) {
                // This is a chunk account timing issue - the chunk was created but not yet indexed
                // The SDK creates the chunk, confirms it, then immediately tries to execute it
                // But the RPC hasn't indexed the chunk account yet
                // 
                // IMPORTANT: When we retry signAndSendTransaction, the SDK creates a NEW chunk
                // So we need to wait longer to give the RPC time to index accounts in general
                // Devnet RPCs are particularly slow at indexing
                if (retries < maxRetries) {
                  retries++;
                  
                  // Wait longer for devnet (RPCs are slower) vs mainnet
                  // Devnet RPCs can take 15-20 seconds to index accounts after confirmation
                  // This is a known issue with public devnet RPCs - they're slow at indexing
                  // IMPORTANT: When we retry, SDK creates a NEW chunk with a NEW nonce
                  // So the chunk account address will be different - we can't poll for it
                  // We just need to wait long enough for RPC to be ready to index new accounts
                  const baseWaitTime = network === "devnet" ? 15000 : 5000; // 15s for devnet, 5s for mainnet
                  const waitTime = baseWaitTime * retries; // Exponential backoff: 15s/30s for devnet, 5s/10s for mainnet
                  
                  console.warn(
                    `Chunk account not yet indexed (account: ${errorAccountAddress}), ` +
                    `waiting ${waitTime}ms for RPC indexing... (${retries}/${maxRetries})`
                  );
                  toast.error(
                    `Transaction chunk created, waiting for RPC indexing... (${retries}/${maxRetries})`
                  );
                  
                  // Poll for chunk account to be available (up to waitTime)
                  // Note: When we retry, SDK creates a NEW chunk with a different address
                  // So we're polling for the old chunk just to ensure RPC has time to index
                  const chunkPubkey = new PublicKey(errorAccountAddress);
                  const maxPollAttempts = Math.ceil(waitTime / 1000); // Poll every 1 second
                  let pollAttempts = 0;
                  let accountAvailable = false;
                  
                  while (pollAttempts < maxPollAttempts && !accountAvailable) {
                    try {
                      // Try multiple commitment levels - sometimes "confirmed" isn't enough
                      // Try "finalized" first (most reliable), then "confirmed"
                      let accountInfo = await connection.getAccountInfo(chunkPubkey, "finalized");
                      if (accountInfo === null) {
                        accountInfo = await connection.getAccountInfo(chunkPubkey, "confirmed");
                      }
                      
                      if (accountInfo !== null) {
                        accountAvailable = true;
                        console.log(
                          `Chunk account ${errorAccountAddress} is now available after ${pollAttempts} attempts (${pollAttempts * 1000}ms)`
                        );
                        break;
                      }
                    } catch (pollError: any) {
                      // Check if it's a rate limit error - if so, wait longer
                      const isRateLimit = pollError?.message?.includes("429") || 
                                         pollError?.message?.includes("Too many requests");
                      if (isRateLimit) {
                        console.warn("Rate limited while polling chunk account, waiting longer...");
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s for rate limit
                      }
                      // Account still not available, continue polling
                    }
                    
                    pollAttempts++;
                    if (pollAttempts < maxPollAttempts) {
                      await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every 1 second
                    }
                  }
                  
                  // Always wait additional time before retrying
                  // This ensures RPC has time to index accounts in general
                  // When we retry, SDK creates a NEW chunk, so we need RPC to be ready
                  // Even with Helius RPC, devnet can take 10-15 seconds for account indexing
                  // Mainnet is faster but still needs 3-5 seconds
                  const additionalWait = network === "devnet" ? 15000 : 5000; // 15s devnet, 5s mainnet
                  
                  if (accountAvailable) {
                    console.log(`Chunk account is available, waiting additional ${additionalWait}ms for full RPC sync before retrying...`);
                    // Wait additional time to ensure RPC has fully indexed and synced
                    await new Promise(resolve => setTimeout(resolve, additionalWait));
                    continue;
                  } else {
                    console.warn(
                      `Chunk account still not available after ${maxPollAttempts} attempts (${maxPollAttempts * 1000}ms), ` +
                      `waiting additional ${additionalWait}ms before retry to give RPC more time...`
                    );
                    // Wait additional time before retrying
                    // Devnet RPCs can be very slow at indexing, so wait longer
                    await new Promise(resolve => setTimeout(resolve, additionalWait));
                    continue;
                  }
                }
                
                throw new Error(
                  `Transaction failed: Chunk account not yet available after retries. ` +
                  `The transaction chunk was created but the account "${errorAccountAddress}" hasn't been indexed by the RPC yet. ` +
                  `\n\nThis is a known issue with ${network === "devnet" ? "devnet" : "mainnet"} RPC indexing delays. ` +
                  `Public RPC endpoints can take 15-30 seconds to index accounts after confirmation. ` +
                  `\n\nSolutions:\n` +
                  `1. Wait 20-30 seconds and try again\n` +
                  `2. Use a faster RPC endpoint (e.g., Helius, QuickNode)\n` +
                  `3. Try on mainnet (faster indexing)\n\n` +
                  `The chunk account should be indexed shortly. This is a temporary RPC limitation, not a transaction failure.`
                );
              }
              
              // Try retrying - might be transient RPC issue or account indexing
              if (retries < maxRetries) {
                retries++;
                const waitTime = 3000 * retries; // Longer wait: 3s, 6s
                console.warn(`Retrying transaction (${retries}/${maxRetries}) - error about account ${errorAccountAddress}, waiting ${waitTime}ms`);
                toast.error(`Retrying transaction... (${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
              }
              
              // Re-throw with context
              throw new Error(
                `Transaction failed: ${errorMessage}. ` +
                `This error is about account "${errorAccountAddress || "unknown"}", not the recipient "${options.recipient}". ` +
                `This might be a temporary RPC indexing issue. Please wait 5-10 seconds and try again.`
              );
            }
          }
          
          // If it's not TransactionTooOld or AccountNotFound, throw the error
          throw error;
        }
      }

      if (!signature) {
        throw new Error("Failed to send transaction after retries. Please try again.");
      }

      setLastSignature(signature);
      setLastTransaction({
        signature,
        type: "SOL",
        amount: options.amount,
        recipient: recipientAddress,
        network,
      });
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
    if (!isConnected || !effectiveWalletAddress) {
      throw new Error("Wallet not connected");
    }

    // Validate effectiveWalletAddress is a valid string
    if (typeof effectiveWalletAddress !== "string" || effectiveWalletAddress.trim() === "") {
      throw new Error("Invalid wallet address. Please reconnect your wallet.");
    }

    if (!options.recipient || options.recipient.trim() === "") {
      throw new Error("Recipient address is required");
    }

    setIsTransferring(true);
    setLastSignature(null);
    setLastTransaction(null);

    try {
      // Use network-aware config
      const config = getLazorkitConfig(network);
      const connection = new Connection(config.RPC_URL, {
        commitment: "confirmed",
      });
      
      // Use network-specific USDC mint
      const usdcMint = network === "mainnet" ? MAINNET_USDC_MINT : DEVNET_USDC_MINT;
      
      // Validate and create PublicKeys with better error handling
      let tokenMint: PublicKey;
      let senderPubkey: PublicKey;
      let recipientPubkey: PublicKey;

      try {
        tokenMint = new PublicKey(options.tokenMint || usdcMint);
      } catch (error) {
        throw new Error(`Invalid token mint address: ${options.tokenMint || usdcMint}`);
      }

      try {
        // Use the PublicKey directly if we have it, otherwise create from string
        if (effectiveSenderPubkey) {
          senderPubkey = effectiveSenderPubkey;
        } else if (effectiveWalletAddress) {
          // Validate the address format before creating PublicKey
          if (effectiveWalletAddress.length < 32) {
            throw new Error("Wallet address is too short or invalid");
          }
          senderPubkey = new PublicKey(effectiveWalletAddress);
        } else {
          throw new Error("No wallet address available");
        }
        
        // Verify the public key is valid by checking it can be converted to Base58
        const base58 = senderPubkey.toBase58();
        if (!base58 || base58.length < 32) {
          throw new Error("Invalid public key format");
        }
      } catch (error: any) {
        console.error("Failed to get sender PublicKey:", {
          effectiveWalletAddress,
          effectiveSenderPubkey: effectiveSenderPubkey?.toString(),
          smartWalletAddress,
          smartWalletPubkey: smartWalletPubkey?.toString(),
          walletSmartWallet,
          wallet: lazorkitWallet?.wallet,
          error: error.message,
        });
        throw new Error(`Invalid sender wallet address: ${error.message}. Please reconnect your wallet.`);
      }

      try {
        recipientPubkey = new PublicKey(options.recipient.trim());
        // Verify recipient public key is valid
        const recipientBase58 = recipientPubkey.toBase58();
        if (!recipientBase58 || recipientBase58.length < 32) {
          throw new Error("Recipient address format is invalid");
        }
      } catch (error: any) {
        console.error("Failed to create recipient PublicKey:", {
          recipient: options.recipient,
          error: error.message,
        });
        throw new Error(`Invalid recipient address: ${options.recipient}. ${error.message}`);
      }

      // Get associated token addresses
      // Smart wallets are PDAs (off-curve), so we need allowOwnerOffCurve: true for sender
      let senderATA: PublicKey;
      let recipientATA: PublicKey;
      
      try {
        // Check if sender is on-curve
        const senderIsOnCurve = PublicKey.isOnCurve(senderPubkey);
        senderATA = getAssociatedTokenAddressSync(
        tokenMint,
          senderPubkey,
          !senderIsOnCurve // allowOwnerOffCurve: true if off-curve (smart wallet)
        );
      } catch (error: any) {
        console.error("Failed to get sender ATA:", {
          tokenMint: tokenMint.toBase58(),
          senderPubkey: senderPubkey.toBase58(),
          senderIsOnCurve: PublicKey.isOnCurve(senderPubkey),
          error: error.message,
        });
        throw new Error(`Failed to get sender token account: ${error.message}`);
      }

      try {
        // Check if recipient is on-curve
        const recipientIsOnCurve = PublicKey.isOnCurve(recipientPubkey);
        recipientATA = getAssociatedTokenAddressSync(
        tokenMint,
          recipientPubkey,
          !recipientIsOnCurve // allowOwnerOffCurve: true if off-curve (smart wallet)
        );
      } catch (error: any) {
        console.error("Failed to get recipient ATA:", {
          tokenMint: tokenMint.toBase58(),
          recipientPubkey: recipientPubkey.toBase58(),
          recipientIsOnCurve: PublicKey.isOnCurve(recipientPubkey),
          recipient: options.recipient,
          error: error.message,
        });
        throw new Error(`Failed to get recipient token account: ${error.message}. Please check the recipient address is valid.`);
      }

      // Check if sender has token account - if not, the transfer will fail
      let instructions: TransactionInstruction[] = [];
      let senderBalanceChecked = false;
      try {
        const senderAccount = await getAccount(connection, senderATA);
        // Check if sender has sufficient balance
        const balance = Number(senderAccount.amount);
        const requiredAmount = options.amount * 1_000_000; // USDC has 6 decimals
        if (balance < requiredAmount) {
          throw new Error(
            `Insufficient balance. Required: ${options.amount} USDC, Available: ${balance / 1_000_000} USDC`
          );
        }
        senderBalanceChecked = true;
      } catch (error: any) {
        // Handle rate limiting (429) errors FIRST - check multiple error formats
        const errorMessage = error?.message || "";
        const errorCode = error?.code || error?.error?.code;
        const errorStatus = error?.status;
        
        // Check for rate limiting errors first (before checking for missing account)
        if (
          errorMessage.includes("429") ||
          errorCode === 429 ||
          errorStatus === 429 ||
          errorMessage.includes("Too many requests") ||
          errorMessage.includes("Too many requests from your IP")
        ) {
          console.warn("RPC rate limited while checking sender account. Proceeding with transfer - balance check will happen on-chain.");
          // Don't throw - let the transaction proceed, it will fail on-chain if balance is insufficient
          // This is better than blocking the user due to RPC rate limits
          senderBalanceChecked = false; // Mark as not checked due to rate limit
        } else if (error.name === "TokenAccountNotFoundError" || errorMessage.includes("could not find account")) {
          // Only throw this error if we're sure it's not a rate limit issue
          // Check one more time that it's not a rate limit error in the message
          if (!errorMessage.includes("429") && !errorMessage.includes("Too many requests")) {
            throw new Error(
              `Sender token account not found. You need to receive USDC first to create a token account.`
            );
          } else {
            // It's actually a rate limit error, proceed
            console.warn("RPC rate limited (detected in error message). Proceeding with transfer.");
            senderBalanceChecked = false;
          }
        } else {
          // For other errors, log and proceed (let on-chain validation catch issues)
          console.warn("Error checking sender account, proceeding with transfer:", error);
          senderBalanceChecked = false;
        }
      }

      // Check if recipient has token account, create if needed
      try {
        await getAccount(connection, recipientATA);
      } catch (error: any) {
        // Handle rate limiting (429) errors - check multiple error formats
        const errorMessage = error?.message || "";
        const errorCode = error?.code || error?.error?.code;
        const errorStatus = error?.status;
        
        if (
          errorMessage.includes("429") ||
          errorCode === 429 ||
          errorStatus === 429 ||
          errorMessage.includes("Too many requests")
        ) {
          console.warn("RPC rate limited while checking recipient account. Will attempt to create ATA.");
          // Assume account doesn't exist and create it
        } else if (error.name === "TokenAccountNotFoundError" || errorMessage.includes("could not find account")) {
          // Account doesn't exist, will create it below
        } else {
          // For other errors, log but still try to create ATA (it's idempotent)
          console.warn("Error checking recipient account, will attempt to create ATA:", error);
        }
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

      // Get fresh blockhash from server before first attempt (helps prevent TransactionTooOld errors)
      await getFreshBlockhash(network);

      // Log instructions for debugging
      console.log("=== Token Transfer Instructions ===");
      console.log("Number of instructions:", instructions.length);
      instructions.forEach((ix, idx) => {
        console.log(`Instruction ${idx + 1}:`, {
          programId: ix.programId.toBase58(),
          keys: ix.keys.map(k => ({
            pubkey: k.pubkey.toBase58(),
            isSigner: k.isSigner,
            isWritable: k.isWritable,
          })),
          dataLength: ix.data.length,
        });
      });

      // Sign and send transaction gaslessly
      // Set clusterSimulation to match the current network for accurate simulation
      // Retry logic for TransactionTooOld errors (can happen if user takes too long to sign)
      let signature: string | undefined;
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          const transactionOptions = {
            feeToken: options.feeToken || "USDC", // Pay fees with USDC
            clusterSimulation: network, // Use current network for simulation
          };
          
          const payload = {
            instructions,
            transactionOptions,
          };
          
          // Log transaction options for debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.log("=== Token Transfer Transaction Options ===");
            console.log("Fee Token:", transactionOptions.feeToken);
            console.log("Cluster Simulation:", transactionOptions.clusterSimulation);
            console.log("Network:", network);
            console.log("Retry Attempt:", retries + 1, "/", maxRetries + 1);
            console.log("=== Full Payload to signAndSendTransaction ===");
            console.log(JSON.stringify({
              instructions: instructions.map(ix => ({
                programId: ix.programId.toBase58(),
                keys: ix.keys.map(k => ({
                  pubkey: k.pubkey.toBase58(),
                  isSigner: k.isSigner,
                  isWritable: k.isWritable,
                })),
                dataLength: ix.data.length,
              })),
              transactionOptions,
            }, null, 2));
          }
          
          signature = await (signAndSendTransaction as any)(payload);
          break; // Success, exit retry loop
        } catch (error: any) {
          const errorMessage = error?.message || "";
          const errorCode = error?.code || "";
          const errorStack = error?.stack || "";
          
          // Check if it's a TransactionTooOld error (0x1783 = 6019)
          // This can happen during CreateChunk if the user takes too long to sign
          // The Paymaster already retries 3 times, so if we get this error, we need to wait longer
          const isTransactionTooOld = 
            errorMessage.includes("TransactionTooOld") ||
            errorMessage.includes("Transaction is too old") ||
            errorMessage.includes("0x1783") ||
            errorCode === 6019 ||
            errorMessage.includes("6019");
          
          // Check if error is from CreateChunk (happens during chunk creation)
          const isCreateChunkError = 
            errorMessage.includes("CreateChunk") ||
            errorMessage.includes("Instruction: CreateChunk") ||
            errorStack.includes("CreateChunk");
          
          if (isTransactionTooOld && retries < maxRetries) {
            retries++;
            
            // If Paymaster already retried, or if it's a CreateChunk error, wait longer
            const paymasterRetried = errorMessage.includes("All retry attempts failed") ||
                                   errorMessage.includes("All sign retry attempts failed");
            
            // Wait longer for CreateChunk errors or if Paymaster already retried
            const waitTime = (isCreateChunkError || paymasterRetried) 
              ? (network === "devnet" ? 3000 : 2000) // 3s devnet, 2s mainnet
              : 1000; // 1s for regular TransactionTooOld
            
            console.warn(
              `TransactionTooOld error${isCreateChunkError ? " during CreateChunk" : ""}${paymasterRetried ? " (Paymaster already retried)" : ""}, ` +
              `waiting ${waitTime}ms and retrying (${retries}/${maxRetries})...`
            );
            toast.error(
              `Transaction expired${isCreateChunkError ? " during creation" : ""}. ` +
              `Retrying... (${retries}/${maxRetries})`
            );
            
            // Get fresh blockhash from server before retrying (helps ensure RPC is ready)
            await getFreshBlockhash(network);
            
            // Wait for blockhash to refresh
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // If it's not TransactionTooOld or we've exhausted retries, throw the error
          throw error;
        }
      }

      if (!signature) {
        throw new Error("Failed to send transaction after retries. Please try again.");
      }

      setLastSignature(signature);
      setLastTransaction({
        signature,
        type: "USDC",
        amount: options.amount,
        recipient: options.recipient.trim(),
        network,
      });
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
      lastTransaction,
    };
}

