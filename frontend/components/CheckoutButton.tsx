"use client";

import { useState } from "react";
import { paymentAPI } from "@/lib/api/payment";
import { loadStripe } from "@stripe/stripe-js";

interface CheckoutButtonProps {
  cartId: number;
  total: number;
  disabled?: boolean;
}

export default function CheckoutButton({
  cartId,
  total,
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const session = await paymentAPI.createCheckoutSession(cartId);

      // Load Stripe
      const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      );
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // Redirect to checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.session_id,
      });

      if (result.error) {
        setError(result.error.message || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process checkout",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className="w-full bg-[#0404ae] hover:bg-[#0404ae]/90 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 mb-4 group"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            Proceed to Checkout
            <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </>
        )}
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
}
