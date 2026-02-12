"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  }[type];

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
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div
                className={`p-3 rounded-full bg-opacity-10 ${typeStyles.icon} ${
                  type === "danger"
                    ? "bg-red-600"
                    : type === "warning"
                      ? "bg-yellow-600"
                      : "bg-blue-600"
                }`}
              >
                <AlertTriangle className={`h-8 w-8 ${typeStyles.icon}`} />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[var(--charcoal)] mb-2">
                {title}
              </h3>
              <p className="text-[var(--charcoal)]/70">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-[var(--slate-200)] text-[var(--charcoal)] rounded-lg font-semibold hover:bg-[var(--slate-300)] transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-colors ${typeStyles.button}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
