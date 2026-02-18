"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader } from "lucide-react";
import { apiClient, setAuthTokens } from "@/lib/api";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await apiClient.login(email, password);
      if (response.access_token) {
        setAuthTokens(response.access_token, response.refresh_token);

        // Fetch user info to get role
        const user = await apiClient.getCurrentUser();

        setSuccess("Login successful!");
        // Redirect to dashboard
        setTimeout(() => {
          if (user.role === "admin") {
            window.location.href = "/admin/books";
          } else {
            window.location.href = "/books";
          }
        }, 500);
      } else {
        setError("No access token received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
          {success}
        </div>
      )}
      <div className="space-y-2">
        <label
          className="text-xs font-semibold uppercase tracking-wider text-[var(--charcoal)]/70"
          htmlFor="email"
        >
          Email Address
        </label>
        <input
          className="w-full rounded-lg border border-[var(--slate-200)] bg-[var(--off-white)]/60 px-4 py-3 text-[var(--charcoal)] outline-none transition-all focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)]"
          id="email"
          placeholder="email@example.com"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            className="text-xs font-semibold uppercase tracking-wider text-[var(--charcoal)]/70"
            htmlFor="password"
          >
            Password
          </label>
          <a
            className="text-xs font-medium text-[var(--navy)] hover:underline"
            href="#"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input
            className="w-full rounded-lg border border-[var(--slate-200)] bg-[var(--off-white)]/60 px-4 py-3 pr-10 text-[var(--charcoal)] outline-none transition-all focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)]"
            id="password"
            placeholder="••••••••"
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)]/50 hover:text-[var(--charcoal)]/70 transition-colors"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-[var(--charcoal)]/70">
        <input
          className="h-4 w-4 rounded border-[var(--slate-200)] text-[var(--navy)] focus:ring-[var(--navy)]"
          id="remember"
          type="checkbox"
          disabled={isLoading}
        />
        Keep me signed in
      </label>
      <button
        className="w-full rounded-lg bg-[var(--navy)] px-4 py-3.5 font-semibold text-[var(--white)] shadow-md transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        type="submit"
        disabled={isLoading}
      >
        {isLoading && <Loader className="h-4 w-4 animate-spin" />}
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
