"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState("Processing your sign-in...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const error = params.get("error");

        if (error) {
          setStatus(`Error: ${error}`);
          // Send error to parent window
          if (window.opener) {
            window.opener.postMessage(
              { type: "GOOGLE_AUTH_ERROR", error },
              window.location.origin,
            );
            setTimeout(() => window.close(), 2000);
          }
          return;
        }

        if (code) {
          // Send code to parent window
          if (window.opener) {
            window.opener.postMessage(
              { type: "GOOGLE_AUTH_CODE", code },
              window.location.origin,
            );
            setStatus("Sign-in successful! Closing...");
            setTimeout(() => window.close(), 1500);
          }
        } else {
          setStatus("No authorization code received");
        }
      } catch (err) {
        setStatus(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--off-white)]">
      <div className="space-y-4 text-center">
        <Loader className="mx-auto h-8 w-8 animate-spin text-[var(--navy)]" />
        <p className="text-[var(--charcoal)]">{status}</p>
      </div>
    </div>
  );
}
