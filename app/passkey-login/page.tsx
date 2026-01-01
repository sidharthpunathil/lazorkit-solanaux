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
  const { isConnected, signMessage, fetchBalance } = useLazorkitWallet();

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
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Passkey Login</h1>
          <p className="text-gray-600 text-lg">
            Authenticate with biometric passkeys. No seed phrases,
            no extensions - just secure, passwordless authentication.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Connect Wallet</h2>

          {!isConnected ? (
            <div>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Click the button below to connect using your passkey. You'll be prompted
                to use your device's biometric authentication (Face ID, Touch ID, or
                fingerprint).
              </p>
              <ConnectButton />
            </div>
          ) : (
            <div>
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 font-semibold mb-1.5 text-sm">Wallet Connected</p>
                <p className="text-xs text-green-600/80">
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

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Sign Message</h2>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Test message signing with your passkey. This is useful for
                authentication without sending transactions. The signature uses WebAuthn P256 curve.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2.5">
                    Message to Sign
                  </label>
                  <input
                    type="text"
                    value={messageToSign}
                    onChange={(e) => setMessageToSign(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 font-medium transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter message to sign"
                  />
                </div>

                <button
                  onClick={handleSignMessage}
                  disabled={isSigning || !messageToSign || !signMessage}
                  className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSigning ? "Signing..." : "Sign Message"}
                </button>

                {signature && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm font-semibold text-green-700 mb-2.5">
                      Message Signed Successfully
                    </p>
                    <code className="text-xs text-green-600/80 break-all font-mono whitespace-pre-wrap bg-green-50/50 p-2 rounded-lg block">
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
