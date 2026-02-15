"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { paymentAPI } from "@/lib/api/payment";
import { apiClient } from "@/lib/api";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsLoggedIn(!!token);
    if (token) {
      checkUserRole();
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

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/login";
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0404ae]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f8] min-h-screen text-slate-900">
      <SiteHeader
        cartCount={0}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-[#0404ae] font-medium no-underline hover:text-[#0404ae]/80 transition-all"
          >
            <span className="material-icons text-sm mr-2">arrow_back</span>
            Back to Cart
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <span className="material-icons text-4xl text-[#0404ae]">
                shopping_bag
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Proceeding to Checkout</h1>
            <p className="text-slate-500">
              You will be redirected to our secure payment page...
            </p>
          </div>

          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0404ae]"></div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">
              If you are not redirected automatically, please{" "}
              <Link href="/cart" className="font-semibold underline">
                return to your cart
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f8]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0404ae]"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
