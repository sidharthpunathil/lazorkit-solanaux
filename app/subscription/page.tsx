/**
 * Subscription Service Page
 * 
 * Demonstrates recurring payments using smart wallet delegation.
 * 
 * Key Features:
 * - One-time approval for recurring charges
 * - Automated billing without user signatures
 * - Cancel subscription anytime
 * - Smart wallet policy delegation
 * 
 * Use Cases:
 * - SaaS subscriptions
 * - Streaming services
 * - Membership fees
 * - Automated donations
 * 
 * Note: This is a simplified demo. In production, you'd need:
 * - Backend service to trigger recurring charges
 * - Smart contract for subscription management
 * - Proper delegation setup with time limits
 */

"use client";

import { useState } from "react";
import { Navigation, InfoCard } from "@/components";
import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";
import { useGaslessTransfer } from "@/lib/hooks/useGaslessTransfer";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  interval: string;
  recipient: string;
  status: "active" | "cancelled";
  createdAt: string;
  lastCharge?: string;
  nextCharge?: string;
}

export default function SubscriptionPage() {
  const { isConnected, smartWalletAddress } = useLazorkitWallet();
  const { transferToken, isTransferring } = useGaslessTransfer();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    amount: "5",
    interval: "monthly",
    recipient: "",
  });

  const handleCreateSubscription = async () => {
    if (
      !newSubscription.name ||
      !newSubscription.recipient ||
      !newSubscription.amount
    ) {
      alert("Please fill in all fields");
      return;
    }

    const subscription: Subscription = {
      id: Date.now().toString(),
      name: newSubscription.name,
      amount: parseFloat(newSubscription.amount),
      interval: newSubscription.interval,
      recipient: newSubscription.recipient,
      status: "active",
      createdAt: new Date().toISOString(),
      nextCharge: new Date(
        Date.now() +
          (newSubscription.interval === "monthly" ? 30 : 7) *
            24 *
            60 *
            60 *
            1000
      ).toISOString(),
    };

    setSubscriptions([...subscriptions, subscription]);
    setNewSubscription({ name: "", amount: "5", interval: "monthly", recipient: "" });

    alert(
      "Subscription created! In production, this would set up on-chain delegation for automated billing."
    );
  };

  const handleCharge = async (subscription: Subscription) => {
    if (!subscription.recipient) {
      alert("Recipient address not set");
      return;
    }

    try {
      await transferToken({
        recipient: subscription.recipient,
        amount: subscription.amount,
        feeToken: "USDC",
      });

      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === subscription.id
            ? {
                ...sub,
                lastCharge: new Date().toISOString(),
                nextCharge: new Date(
                  Date.now() +
                    (subscription.interval === "monthly" ? 30 : 7) *
                      24 *
                      60 *
                      60 *
                      1000
                ).toISOString(),
              }
            : sub
        )
      );
    } catch (error) {
      console.error("Charge failed:", error);
    }
  };

  const handleCancel = (subscriptionId: string) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === subscriptionId ? { ...sub, status: "cancelled" } : sub
      )
    );
    alert(
      "Subscription cancelled. In production, this would revoke the delegation policy."
    );
  };

  return (
    <div className="min-h-screen px-6 py-12 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Navigation />

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Subscription Service</h1>
          <p className="text-muted-foreground text-lg">
            Set up recurring USDC payments with smart wallet delegation. One-time approval,
            automated billing.
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
            <p className="text-yellow-400">
              Please connect your wallet first.{" "}
              <a href="/passkey-login" className="text-yellow-300 hover:text-yellow-200 underline transition-colors">
                Go to Passkey Login →
              </a>
            </p>
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Create Subscription</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Set up a recurring payment. After approval, charges will happen
                automatically without requiring your signature each time.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={newSubscription.name}
                    onChange={(e) =>
                      setNewSubscription({ ...newSubscription, name: e.target.value })
                    }
                    placeholder="e.g., Premium Plan"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newSubscription.amount}
                      onChange={(e) =>
                        setNewSubscription({
                          ...newSubscription,
                          amount: e.target.value,
                        })
                      }
                      placeholder="5"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Interval
                    </label>
                    <select
                      value={newSubscription.interval}
                      onChange={(e) =>
                        setNewSubscription({
                          ...newSubscription,
                          interval: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={newSubscription.recipient}
                    onChange={(e) =>
                      setNewSubscription({
                        ...newSubscription,
                        recipient: e.target.value,
                      })
                    }
                    placeholder="Enter recipient Solana address"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <button
                  onClick={handleCreateSubscription}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/20"
                >
                  Create Subscription
                </button>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Subscriptions</h2>

              {subscriptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active subscriptions. Create one above to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className={`p-4 border rounded-lg ${
                        subscription.status === "active"
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{subscription.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subscription.amount} USDC per {subscription.interval}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            subscription.status === "active"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {subscription.status}
                        </span>
                      </div>

                      {subscription.nextCharge && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Next charge:{" "}
                          {new Date(subscription.nextCharge).toLocaleDateString()}
                        </p>
                      )}

                      {subscription.lastCharge && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Last charged:{" "}
                          {new Date(subscription.lastCharge).toLocaleDateString()}
                        </p>
                      )}

                      <div className="flex gap-2 mt-4">
                        {subscription.status === "active" && (
                          <>
                            <button
                              onClick={() => handleCharge(subscription)}
                              disabled={isTransferring}
                              className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 text-sm font-medium transition-colors"
                            >
                              {isTransferring ? "Processing..." : "Charge Now (Demo)"}
                            </button>
                            <button
                              onClick={() => handleCancel(subscription.id)}
                              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <InfoCard
              title="How Subscription Billing Works"
              items={[
                "User approves a delegation policy that allows recurring charges",
                "Backend service (cron job) triggers charges at scheduled intervals",
                "No user signature required after initial approval (up to policy limits)",
                "User can cancel anytime, which revokes the delegation policy",
                "Note: This is a simplified demo. Production implementation requires:",
                "- On-chain delegation policy setup",
                "- Backend service for automated billing",
                "- Smart contract for subscription management",
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
