"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "lg",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-lg shadow-xl ${maxWidthClass} w-full transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--slate-200)] px-6 py-4">
            <h2 className="text-xl font-bold text-[var(--charcoal)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--beige)]/30 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-[var(--charcoal)]" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
