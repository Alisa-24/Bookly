"use client";

import Link from "next/link";
import { BookOpen, Search, ShoppingCart, User, LogOut } from "lucide-react";

interface SiteHeaderProps {
  cartCount: number;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

export default function SiteHeader({
  cartCount,
  isLoggedIn,
  isAdmin,
  onLogout,
  searchQuery = "",
  onSearchChange,
  showSearch = true,
}: SiteHeaderProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--navy)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/books" className="flex-shrink-0 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-[var(--navy)]" />
            <span className="text-2xl font-bold tracking-tight text-[var(--navy)] font-serif italic">
              Bookly
            </span>
          </Link>

          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  className="w-full bg-[var(--beige)]/30 border-transparent focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] rounded-full px-5 py-2.5 pl-12 text-sm"
                  placeholder="Search by title..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
                <Search className="absolute left-4 top-2.5 h-5 w-5 text-[var(--charcoal)]/40" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-6">
            {isLoggedIn && (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/books"
                  className="text-sm text-[var(--charcoal)] hover:text-[var(--navy)] transition-colors font-medium"
                >
                  Books
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-[var(--charcoal)] hover:text-[var(--navy)] transition-colors font-medium"
                >
                  Orders
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/books"
                    className="text-sm text-[var(--navy)] hover:text-[var(--navy)]/70 transition-colors font-medium bg-[var(--navy)]/10 px-3 py-1 rounded-full"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-[var(--navy)]/10 text-[var(--navy)] px-4 py-2 rounded-full font-semibold hover:bg-[var(--navy)] hover:text-white transition-all text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-[var(--navy)]/10 text-[var(--navy)] px-4 py-2 rounded-full font-semibold hover:bg-[var(--navy)] hover:text-white transition-all text-sm"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}
              <Link
                href="/cart"
                className="relative p-2 text-[var(--navy)] hover:bg-[var(--navy)]/10 rounded-full transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--navy)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
