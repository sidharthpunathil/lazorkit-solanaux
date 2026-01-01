/**
 * Passkey Login Page
 * 
 * Demonstrates the core Lazorkit feature: passkey-based authentication.
 * 
 * Key Features:
 * - One-click login with biometric authentication (Face ID/Touch ID)
 * - Automatic smart wallet creation
 * - Session persistence across page refreshes
 * - Display wallet information and balance
 * 
 * Why Passkeys?
 * - No seed phrases to manage or lose
 * - No browser extensions required
 * - Secure biometric authentication
 * - Cross-device support (same passkey works on multiple devices)
 */

"use client";

import { useState, useEffect } from "react";
import { Navigation, ConnectButton, WalletInfo, InfoCard } from "@/components";
import { useLazorkitWallet } from "@/lib/hooks/useLazorkitWallet";

export default function PasskeyLoginPage() {
  const { isConnected, signMessage, isSignMessageAvailable, fetchBalance } = useLazorkitWallet();

  const [messageToSign, setMessageToSign] = useState("Hello Lazorkit!");
  const [signature, setSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Auto-refresh balance every 30 seconds when connected
  // Using a longer interval to avoid rate limiting from public RPC endpoints
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchBalance();
    }, 30000); // 30 seconds instead of 5 to reduce RPC rate limiting

    return () => clearInterval(interval);
  }, [isConnected, fetchBalance]);

  const handleSignMessage = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!signMessage) {
      alert("Sign message feature is not available. Please ensure you're using the latest @lazorkit/wallet SDK.");
      return;
    }

    setIsSigning(true);
    try {
      const result = await signMessage(messageToSign);
      // Display both signature and signedPayload for verification
      setSignature(`${result.signature}\n\nSigned Payload: ${result.signedPayload}`);
    } catch (error) {
      console.error("Failed to sign message:", error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Navigation />

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Passkey Login</h1>
          <p className="text-muted-foreground text-lg">
            Authenticate with biometric passkeys. No seed phrases,
            no extensions - just secure, passwordless authentication.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Connect Wallet</h2>

          {!isConnected ? (
            <div>
              <p className="text-muted-foreground mb-6">
                Click the button below to connect using your passkey. You'll be prompted
                to use your device's biometric authentication (Face ID, Touch ID, or
                fingerprint).
              </p>
              <ConnectButton />
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-semibold mb-2">Wallet Connected</p>
                <p className="text-sm text-green-400/80">
                  Your session is active. You can refresh the page and you'll stay
                  connected!
                </p>
              </div>
              <ConnectButton />
            </div>
          )}
        </div>

        {isConnected && (
          <>
            <WalletInfo />

            <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Sign Message</h2>
              <p className="text-muted-foreground mb-6">
                Test message signing with your passkey. This is useful for
                authentication without sending transactions. The signature uses WebAuthn P256 curve.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Message to Sign
                  </label>
                  <input
                    type="text"
                    value={messageToSign}
                    onChange={(e) => setMessageToSign(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
                    placeholder="Enter message to sign"
                  />
                </div>

                <button
                  onClick={handleSignMessage}
                  disabled={isSigning || !messageToSign || !signMessage}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
                >
                  {isSigning ? "Signing..." : "Sign Message"}
                </button>

                {signature && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm font-medium text-green-400 mb-2">
                      Message Signed Successfully
                    </p>
                    <code className="text-xs text-green-400/80 break-all font-mono whitespace-pre-wrap">
                      {signature}
                    </code>
                  </div>
                )}
              </div>
            </div>

            <InfoCard
              title="Session Persistence"
              items={[
                "Refresh this page - you'll stay connected",
                "Open a new tab - your session persists",
                "Close and reopen the browser - reconnect automatically",
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
