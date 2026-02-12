"use client";

import { useEffect, useState } from "react";
import { LogOut, BookOpen, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    if (!token) {
      // Redirect to login if no token
      window.location.href = "/login";
      return;
    }

    // Attempt to fetch user info (optional - shows some debugging)
    // For now, we'll just mark as loaded
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-[var(--navy)] mx-auto mb-4 animate-bounce" />
          <p className="text-[var(--charcoal)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      {/* Header */}
      <header className="bg-[var(--navy)] text-[var(--off-white)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold font-serif">Bookly</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--off-white)] text-[var(--navy)] font-semibold hover:bg-[var(--beige)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--charcoal)] mb-2">
            Welcome to Bookly
          </h2>
          <p className="text-lg text-[var(--charcoal)] opacity-75">
            Your personal book collection and reading companion
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Link
            href="/dashboard/add-book"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--navy)] text-[var(--off-white)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Add Your First Book
          </Link>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg border border-[var(--slate-200)] p-12 text-center">
          <BookOpen className="h-16 w-16 text-[var(--navy)] mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-2">
            No books yet
          </h3>
          <p className="text-[var(--charcoal)] opacity-75 mb-6">
            Start building your collection by adding your first book
          </p>
          <Link
            href="/dashboard/add-book"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--navy)] text-[var(--off-white)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Add a Book
          </Link>
        </div>
      </main>
    </div>
  );
}
