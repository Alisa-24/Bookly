"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    const token = localStorage.getItem("auth_token");
    if (token) {
      window.location.href = "/books";
    }
  }, []);

  return (
    <section className="rounded-2xl border border-[var(--slate-100)] bg-[var(--white)] p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-serif font-bold sm:text-3xl">
          Welcome Back
        </h1>
        <p className="text-sm text-[var(--charcoal)]/70">
          Sign in to continue your reading journey.
        </p>
      </div>
      <LoginForm />
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--slate-100)]"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-medium">
          <span className="bg-[var(--white)] px-4 text-[var(--charcoal)]/45">
            Or continue with
          </span>
        </div>
      </div>
      <GoogleSignInButton />
      <div className="mt-6 text-center text-sm">
        <span className="text-[var(--charcoal)]/60">New to the community?</span>
        <Link
          className="ml-1 font-semibold text-[var(--navy)] hover:underline"
          href="/register"
        >
          Join Bookly today
        </Link>
      </div>
    </section>
  );
}
