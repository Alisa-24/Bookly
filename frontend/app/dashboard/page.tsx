"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { paymentAPI } from "@/lib/api/payment";
import { cartApi } from "@/lib/api/cart";
import { apiClient } from "@/lib/api";
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

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsLoggedIn(!!token);
    if (token) {
      checkUserRole();
      fetchOrders();
      fetchCartCount();
    } else {
      router.push("/login");
    }
  }, [router]);

  const checkUserRole = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setIsAdmin(user.role === "admin");
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const fetchCartCount = async () => {
    try {
      const cart = await cartApi.getCart();
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // If coming from Stripe callback, verify session first
      if (sessionId) {
        try {
          await paymentAPI.verifySession(sessionId);
          setPaymentSuccess(true);
          fetchCartCount(); // Refresh cart count after verification
        } catch (vErr) {
          console.error("Session verification failed:", vErr);
        }
      }

      const data = await paymentAPI.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
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

  return (
    <div className="flex flex-col min-h-screen bg-[var(--off-white)] text-[var(--charcoal)]">
      <SiteHeader
        cartCount={cartCount}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {paymentSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <span className="material-icons text-green-600 text-3xl">
                check_circle
              </span>
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">
                  Payment Successful!
                </h3>
                <p className="text-green-800">
                  Thank you for your purchase. Your order has been received and
                  is being processed.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <span className="material-icons text-red-600 text-3xl">
                error
              </span>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-1">Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 font-serif">
              Order History
            </h1>
            <p className="text-[var(--charcoal)]/60">
              View and manage your past orders
            </p>
          </div>
          <Link
            href="/books"
            className="px-6 py-2 bg-[var(--navy)] text-white rounded-lg hover:bg-[var(--navy)]/90 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-[var(--navy)]/10 p-12 text-center">
            <span className="material-icons text-6xl text-[var(--charcoal)]/20 mb-4 block">
              shopping_bag
            </span>
            <h2 className="text-2xl font-bold mb-2 font-serif">
              No Orders Yet
            </h2>
            <p className="text-[var(--charcoal)]/60 mb-6">
              You haven't made any purchases yet. Start shopping to create your
              first order!
            </p>
            <Link
              href="/books"
              className="inline-block px-6 py-3 bg-[var(--navy)] text-white rounded-lg hover:bg-[var(--navy)]/90 transition-colors font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow border border-[var(--navy)]/10 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold font-serif">
                        Order #{order.id}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}
                      >
                        <span className="material-icons text-sm">
                          {getStatusIcon(order.status)}
                        </span>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-[var(--charcoal)]/60 text-sm mb-3">
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

                  <div className="text-right">
                    <p className="text-2xl font-bold text-[var(--navy)] mb-2">
                      ${order.total_amount.toFixed(2)}
                    </p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-2 text-[var(--navy)] font-medium hover:text-[var(--navy)]/80 transition-colors"
                    >
                      View Details
                      <span className="material-icons text-sm">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--navy)]"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
