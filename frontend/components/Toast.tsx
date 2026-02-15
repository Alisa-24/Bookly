"use client";

import React from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose }) => {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
      role="status"
      aria-live="polite"
    >
      <div
        className={`rounded-full px-4 py-2 text-sm font-medium shadow-lg border flex items-center gap-2 ${
          type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}
      >
        {message}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
