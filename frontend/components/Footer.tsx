import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--slate-200)] bg-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-8 w-8 text-[var(--navy)]" />
              <span className="text-2xl font-bold tracking-tight text-[var(--navy)] font-serif italic">
                Bookly
              </span>
            </div>
            <p className="text-[var(--charcoal)]/60 max-w-sm mb-8 italic">
              Your gateway to thousands of worlds, curated for the modern reader
              who values both style and substance.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-[var(--charcoal)]/60 text-sm">
              <li>
                <a
                  className="hover:text-[var(--navy)] transition-colors"
                  href="#"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[var(--navy)] transition-colors"
                  href="#"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-[var(--charcoal)]/60 text-sm">
              <li>
                <a
                  className="hover:text-[var(--navy)] transition-colors"
                  href="#"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="hover:text-[var(--navy)] transition-colors"
                  href="#"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[var(--slate-100)] text-center text-[var(--charcoal)]/40 text-xs">
          © 2026 Bookly. Designed for literary lovers.
        </div>
      </div>
    </footer>
  );
}
