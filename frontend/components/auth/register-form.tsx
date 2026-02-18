"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader } from "lucide-react";
import { apiClient, setAuthTokens } from "@/lib/api";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      await apiClient.register(name, email, password);

      // After successful registration, automatically log them in
      const loginResponse = await apiClient.login(email, password);
      if (loginResponse.access_token) {
        setAuthTokens(loginResponse.access_token, loginResponse.refresh_token);
        setSuccess("Account created and logged in!");
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        // If no token from login, redirect to login page
        setSuccess("Account created! Please log in.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
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
      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wider text-[var(--charcoal)]/70"
          htmlFor="name"
        >
          Full Name
        </label>
        <input
          className="w-full rounded-lg border border-[var(--slate-200)] bg-[var(--off-white)]/60 px-4 py-2.5 text-[var(--charcoal)] outline-none transition-all focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)]"
          id="name"
          placeholder="Your name"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-xs font-semibold uppercase tracking-wider text-[var(--charcoal)]/70"
          htmlFor="email"
        >
          Email Address
        </label>
        <input
          className="w-full rounded-lg border border-[var(--slate-200)] bg-[var(--off-white)]/60 px-4 py-2.5 text-[var(--charcoal)] outline-none transition-all focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)]"
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
        <label
          className="text-xs font-semibold uppercase tracking-wider text-[var(--charcoal)]/70"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            className="w-full rounded-lg border border-[var(--slate-200)] bg-[var(--off-white)]/60 px-4 py-2.5 pr-10 text-[var(--charcoal)] outline-none transition-all focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)]"
            id="password"
            placeholder="Create a password"
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
      <div className="space-y-2">
        <label
          className="text-xs font-semibold uppercase tracking-wider text-[var(--charcoal)]/70"
          htmlFor="confirm"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            className="w-full rounded-lg border border-[var(--slate-200)] bg-[var(--off-white)]/60 px-4 py-2.5 pr-10 text-[var(--charcoal)] outline-none transition-all focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)]"
            id="confirm"
            placeholder="Repeat your password"
            required
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)]/50 hover:text-[var(--charcoal)]/70 transition-colors"
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <label className="flex items-start gap-3 text-sm text-[var(--charcoal)]/70">
        <input
          className="mt-1 h-4 w-4 rounded border-[var(--slate-200)] text-[var(--navy)] focus:ring-[var(--navy)]"
          id="terms"
          type="checkbox"
          required
          disabled={isLoading}
        />
        <span>
          I agree to the{" "}
          <a className="text-[var(--navy)] hover:underline" href="#">
            terms
          </a>{" "}
          and{" "}
          <a className="text-[var(--navy)] hover:underline" href="#">
            privacy policy
          </a>
          .
        </span>
      </label>
      <button
        className="w-full rounded-lg bg-[var(--navy)] px-4 py-3.5 font-semibold text-[var(--white)] shadow-md transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        type="submit"
        disabled={isLoading}
      >
        {isLoading && <Loader className="h-4 w-4 animate-spin" />}
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
