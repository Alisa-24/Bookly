"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { paymentAPI } from "@/lib/api/payment";
import { apiClient, clearAuthTokens, getAccessToken } from "@/lib/api";
import Footer from "@/components/Footer";

interface Order {
  id: number;
  user_id: string;
  cart_id: number;
  total_amount: number;
  status: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(!!token);
    if (token) {
      checkUserRole();
      fetchOrder();
    } else {
      router.push("/login");
    }
  }, [router, orderId]);

  const checkUserRole = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setIsAdmin(user.role === "admin");
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await paymentAPI.getOrder(parseInt(orderId));
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/login";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "check_circle";
      case "pending":
        return "schedule";
      case "refunded":
        return "cancel";
      default:
        return "help";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--navy)]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[var(--off-white)] min-h-screen text-[var(--charcoal)]">
        <SiteHeader
          cartCount={0}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          searchQuery=""
          onSearchChange={() => {}}
        />

        <main className="max-w-7xl mx-auto px-6 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[var(--navy)] font-medium no-underline hover:text-[var(--navy)]/80 transition-all mb-8"
          >
            <span className="material-icons text-sm mr-2">arrow_back</span>
            Back to Orders
          </Link>

          <div className="bg-white rounded-xl shadow-lg border border-[var(--navy)]/10 p-12 text-center">
            <span className="material-icons text-6xl text-red-300 mb-4 block">
              error
            </span>
            <h2 className="text-2xl font-bold mb-2 text-red-900 font-serif">
              Order Not Found
            </h2>
            <p className="text-[var(--charcoal)]/60 mb-6">
              {error || "Order details could not be loaded"}
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-[var(--navy)] text-white rounded-lg hover:bg-[var(--navy)]/90 transition-colors font-medium"
            >
              Return to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--off-white)] text-[var(--charcoal)]">
      <SiteHeader
        cartCount={0}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-[var(--navy)] font-medium no-underline hover:text-[var(--navy)]/80 transition-all mb-8"
        >
          <span className="material-icons text-sm mr-2">arrow_back</span>
          Back to Orders
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-[var(--navy)]/10 p-8 mb-8">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-[var(--navy)]/10">
            <div>
              <h1 className="text-3xl font-bold mb-2 font-serif">
                Order #{order.id}
              </h1>
              <p className="text-[var(--charcoal)]/60">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-lg font-bold flex items-center gap-2 ${getStatusColor(order.status)}`}
            >
              <span className="material-icons">
                {getStatusIcon(order.status)}
              </span>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Order Total
              </h3>
              <p className="text-3xl font-bold text-[var(--navy)]">
                ${order.total_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Last Updated
              </h3>
              <p className="text-lg text-[var(--charcoal)]">
                {new Date(order.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--navy)]/10 pt-8">
            <h3 className="text-lg font-bold mb-4 font-serif">
              Payment Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--charcoal)]/60">Order ID:</span>
                <span className="font-mono text-[var(--charcoal)]">
                  #{order.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--charcoal)]/60">Cart ID:</span>
                <span className="font-mono text-[var(--charcoal)]">
                  {order.cart_id}
                </span>
              </div>
              {order.stripe_session_id && (
                <div className="flex justify-between">
                  <span className="text-[var(--charcoal)]/60">Session ID:</span>
                  <span className="font-mono text-[var(--charcoal)] truncate">
                    {order.stripe_session_id}
                  </span>
                </div>
              )}
              {order.stripe_payment_intent_id && (
                <div className="flex justify-between">
                  <span className="text-[var(--charcoal)]/60">
                    Payment Intent:
                  </span>
                  <span className="font-mono text-[var(--charcoal)] truncate">
                    {order.stripe_payment_intent_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="flex-1 text-center px-6 py-3 bg-[var(--navy)]/10 text-[var(--navy)] rounded-lg hover:bg-[var(--navy)]/20 transition-colors font-medium"
          >
            Back to Orders
          </Link>
          <Link
            href="/books"
            className="flex-1 text-center px-6 py-3 bg-[var(--navy)] text-white rounded-lg hover:bg-[var(--navy)]/90 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
