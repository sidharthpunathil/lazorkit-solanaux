/**
 * TransferForm Component
 * 
 * Reusable form component for token transfers.
 * Supports both SOL and SPL token transfers with gasless execution.
 */

"use client";

import { useState } from "react";
import { useGaslessTransfer } from "@/lib/hooks/useGaslessTransfer";

interface TransferFormProps {
  type: "SOL" | "USDC";
  onSuccess?: (signature: string) => void;
  transferSOL?: (options: {
    recipient: string;
    amount: number;
    feeToken?: "SOL" | "USDC";
  }) => Promise<string>;
  transferToken?: (options: {
    recipient: string;
    amount: number;
    feeToken?: "SOL" | "USDC";
  }) => Promise<string>;
  isTransferring?: boolean;
}

export function TransferForm({
  type,
  onSuccess,
  transferSOL: transferSOLProp,
  transferToken: transferTokenProp,
  isTransferring: isTransferringProp,
}: TransferFormProps) {
  const hook = useGaslessTransfer();
  const transferSOL = transferSOLProp || hook.transferSOL;
  const transferToken = transferTokenProp || hook.transferToken;
  const isTransferring = isTransferringProp ?? hook.isTransferring;

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(type === "SOL" ? "0.1" : "1");

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      alert("Please enter recipient and amount");
      return;
    }

    try {
      let signature: string;
      if (type === "SOL") {
        signature = await transferSOL({
          recipient,
          amount: parseFloat(amount),
          feeToken: "SOL",
        });
      } else {
        signature = await transferToken({
          recipient,
          amount: parseFloat(amount),
          feeToken: "USDC",
        });
      }
      onSuccess?.(signature);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  const buttonStyles =
    type === "SOL"
      ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/20"
      : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/20";

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-2 text-foreground">Transfer {type}</h2>
      <p className="text-muted-foreground mb-6">
        {type === "SOL"
          ? "Send SOL to any Solana address. The transaction fee will be sponsored by the paymaster (gasless!)."
          : "Send USDC tokens. Transaction fees will be paid in USDC (no SOL needed!). This is perfect for users who only hold stablecoins."}
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Amount ({type})
          </label>
          <input
            type="number"
            step={type === "SOL" ? "0.001" : "0.01"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={type === "SOL" ? "0.1" : "1"}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={isTransferring || !recipient || !amount}
          className={`w-full px-6 py-3 ${buttonStyles} text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        >
          {isTransferring ? "Sending..." : `Send ${type} (Gasless)`}
        </button>
      </div>
    </div>
  );
}
