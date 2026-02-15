"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Library, Sparkles, Users } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    const token = localStorage.getItem("auth_token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <main className="min-h-screen bg-[var(--off-white)] text-[var(--charcoal)]">
      <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:px-10 lg:px-16">
        <div className="absolute inset-0">
          <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[var(--beige)] blur-3xl"></div>
          <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-[var(--navy)]/10 blur-3xl"></div>
        </div>
        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--slate-200)] bg-[var(--white)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--navy)]">
              <Sparkles className="h-4 w-4" />
              Curated reading experience
            </div>
            <h1 className="text-5xl font-serif font-bold leading-tight sm:text-6xl">
              A modern sanctuary for readers, storytellers, and collectors.
            </h1>
            <p className="max-w-xl text-lg text-[var(--charcoal)]/75">
              Build your personal library, track every chapter, and join a
              thoughtful community that celebrates the power of books.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-[var(--white)] shadow-md transition-all hover:brightness-110"
                href="/books"
              >
                Browse Books
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-[var(--slate-200)] bg-[var(--white)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--beige)]"
                href="/login"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--slate-100)] bg-[var(--white)] p-6 shadow-[var(--shadow)]">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--navy)]">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-serif font-semibold">
                Smart shelves
              </h3>
              <p className="mt-2 text-sm text-[var(--charcoal)]/70">
                Catalog favorites, upcoming reads, and treasured editions in one
                beautifully organized space.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--slate-100)] bg-[var(--white)] p-6 shadow-[var(--shadow)]">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--navy)]">
                <Library className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-serif font-semibold">Reading flow</h3>
              <p className="mt-2 text-sm text-[var(--charcoal)]/70">
                Keep track of progress, notes, and highlights with a ritual that
                feels personal and calm.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--slate-100)] bg-[var(--white)] p-6 shadow-[var(--shadow)] sm:col-span-2">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--beige)] text-[var(--navy)]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-serif font-semibold">
                Thoughtful community
              </h3>
              <p className="mt-2 text-sm text-[var(--charcoal)]/70">
                Share recommendations, build lists together, and host intimate
                book circles with readers who value depth over noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-[var(--slate-100)] bg-[var(--white)] p-10 shadow-[var(--shadow)]">
            <h2 className="text-3xl font-serif font-semibold">
              Designed for calm, consistent reading rituals.
            </h2>
            <p className="mt-4 text-[var(--charcoal)]/70">
              Bookly blends the warmth of a classic library with modern tooling.
              Create shelves, tag editions, and discover new reads from your
              community - all in one seamless space.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--charcoal)]/70">
              <span className="rounded-full border border-[var(--slate-200)] px-4 py-2">
                Curated lists
              </span>
              <span className="rounded-full border border-[var(--slate-200)] px-4 py-2">
                Reading stats
              </span>
              <span className="rounded-full border border-[var(--slate-200)] px-4 py-2">
                Night-by-night notes
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--slate-100)] bg-[var(--navy)] p-10 text-[var(--white)] shadow-[var(--shadow)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--white)]/60">
              Ready to begin
            </p>
            <h3 className="mt-4 text-3xl font-serif font-semibold">
              Join Bookly today.
            </h3>
            <p className="mt-3 text-sm text-[var(--white)]/75">
              Your library awaits - bring your next favorite story home.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--white)] px-5 py-3 text-sm font-semibold text-[var(--navy)]"
              href="/register"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
