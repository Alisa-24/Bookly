"use client";

import { Chrome, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { ErrorModal } from "./error-modal";
import { apiClient } from "@/lib/api";

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check if this window is a callback from Google OAuth
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_AUTH_CODE") {
        try {
          const code = event.data.code;
          // Send code to backend to exchange for token
          const response = await apiClient.googleCallback(code);

          // Store the token
          if (response.access_token) {
            localStorage.setItem("auth_token", response.access_token);
            console.log("Google auth successful");
            // Redirect to dashboard
            window.location.href = "/books";
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to authenticate",
          );
          setShowError(true);
        }
      } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
        setError(event.data.error);
        setShowError(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError("Google Client ID not configured");
        setShowError(true);
        setIsLoading(false);
        return;
      }

      // Redirect to frontend callback which will then handle the OAuth flow
      const redirectUri = `${window.location.origin}/auth/google/callback`;

      const googleAuthUrl = new URL(
        "https://accounts.google.com/o/oauth2/v2/auth",
      );
      googleAuthUrl.searchParams.set("client_id", clientId);
      googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
      googleAuthUrl.searchParams.set("response_type", "code");
      googleAuthUrl.searchParams.set("scope", "profile email");
      googleAuthUrl.searchParams.set("access_type", "offline");

      // Open in popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        googleAuthUrl.toString(),
        "Google Sign In",
        `width=${width},height=${height},left=${left},top=${top}`,
      );
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-[var(--slate-200)] bg-[var(--white)] px-4 py-3.5 text-sm font-semibold text-[var(--charcoal)] shadow-sm transition-colors hover:bg-[var(--off-white)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <Chrome className="h-4 w-4 text-[var(--charcoal)]" />
        )}
        {isLoading ? "Signing in..." : "Continue with Google"}
      </button>
      <ErrorModal
        isOpen={showError}
        title="Sign In Error"
        message={error}
        onClose={() => {
          setShowError(false);
          setError("");
        }}
      />
    </>
  );
}
