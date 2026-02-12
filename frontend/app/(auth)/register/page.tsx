"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useEffect } from "react";

export default function RegisterPage() {
  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    const token = localStorage.getItem("auth_token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <section className="rounded-2xl border border-[var(--slate-100)] bg-[var(--white)] p-5 shadow-[var(--shadow)] sm:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-serif font-bold sm:text-3xl">
          Join Bookly
        </h1>
        <p className="text-sm text-[var(--charcoal)]/70">
          Create your account to start your personal library.
        </p>
      </div>
      <RegisterForm />
      <div className="relative my-4">
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
      <div className="mt-4 text-center text-sm">
        <span className="text-[var(--charcoal)]/60">
          Already have an account?
        </span>
        <Link
          className="ml-1 font-semibold text-[var(--navy)] hover:underline"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    </section>
  );
}
