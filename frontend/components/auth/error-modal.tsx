"use client";

import { X } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function ErrorModal({
  isOpen,
  title,
  message,
  onClose,
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-[var(--slate-100)] bg-[var(--white)] p-8 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-red-600">
              {title}
            </h2>
            <p className="mt-2 text-sm text-[var(--charcoal)]/70">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--charcoal)]/50 hover:text-[var(--charcoal)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[var(--navy)] px-4 py-3 font-semibold text-[var(--white)] hover:brightness-110"
        >
          Close
        </button>
      </div>
    </div>
  );
}
