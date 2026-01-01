/**
 * TransferForm Component
 * 
 * Reusable form component for token transfers.
 * Supports both SOL and SPL token transfers with gasless execution.
 */

"use client";

import { useState } from "react";
import { useGaslessTransfer } from "@/lib/hooks/useGaslessTransfer";
import toast from "react-hot-toast";

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
    } catch (error: any) {
      console.error("Transfer failed:", error);
      // Show user-friendly error message
      const errorMessage = error?.message || "Transfer failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const buttonStyles =
    type === "SOL"
      ? "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
      : "bg-green-600 hover:bg-green-700 active:bg-green-800";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">Transfer {type}</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
        {type === "SOL"
          ? "Send SOL to any Solana address. The transaction fee will be sponsored by the paymaster (gasless!)."
          : "Send USDC tokens. Transaction fees will be paid in USDC (no SOL needed!). This is perfect for users who only hold stablecoins."}
      </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2.5">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 font-mono text-sm transition-all duration-200 hover:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2.5">
            Amount ({type})
          </label>
          <input
            type="number"
            step={type === "SOL" ? "0.001" : "0.01"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={type === "SOL" ? "0.1" : "1"}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 font-medium transition-all duration-200 hover:border-gray-400"
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={isTransferring || !recipient || !amount}
          className={`w-full px-4 py-2.5 ${buttonStyles} text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          {isTransferring ? "Sending..." : `Send ${type}`}
        </button>
      </div>
    </div>
  );
}
