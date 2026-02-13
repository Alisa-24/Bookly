"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cartApi, Cart } from "@/lib/api/cart";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const buildImageSrc = (src: string) => {
    if (src.startsWith("http")) {
      return src;
    }
    const normalized = src.startsWith("/") ? src : `/${src}`;
    return `http://localhost:8000${normalized}`;
  };

  // Helper to calculate totals
  const subtotal =
    cart?.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0,
    ) || 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsLoggedIn(!!token);
    if (token) {
      checkUserRole();
    }
    fetchCart();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setIsAdmin(user.role === "admin");
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      if (
        (error as { status?: number }).status === 401 ||
        (error as { status?: number }).status === 403
      ) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const updatedCart = await cartApi.updateItem(itemId, newQuantity);
      setCart(updatedCart); // API returns updated cart
    } catch (error) {
      console.error("Failed to update quantity:", error);
      if (
        (error as { status?: number }).status === 401 ||
        (error as { status?: number }).status === 403
      ) {
        router.push("/login");
      }
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const updatedCart = await cartApi.removeItem(itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to remove item:", error);
      if (
        (error as { status?: number }).status === 401 ||
        (error as { status?: number }).status === 403
      ) {
        router.push("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/login";
  };

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
        cartCount={itemCount}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/books"
            className="inline-flex items-center text-[#0404ae] font-medium no-underline hover:text-[#0404ae]/80 transition-all"
          >
            <span className="material-icons text-sm mr-2">arrow_back</span>
            Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[70%]">
            <div className="flex justify-between items-end mb-6">
              <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
              <span className="text-slate-500 font-medium">
                {itemCount} items in your bag
              </span>
            </div>

            <div className="space-y-1">
              {cart?.items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                  <span className="material-icons text-6xl text-slate-300 mb-4">
                    shopping_cat
                  </span>
                  <h2 className="text-xl font-semibold mb-2">
                    Your cart is empty
                  </h2>
                  <p className="text-slate-500 mb-6">
                    Looks like you haven't added any books yet.
                  </p>
                  <Link
                    href="/books"
                    className="px-6 py-2 bg-[#0404ae] text-white rounded-lg hover:bg-[#0404ae]/90 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                cart?.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex gap-6 items-start transition-all hover:shadow-md"
                  >
                    <div className="w-24 h-36 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {item.book.images?.[0] ? (
                        <img
                          src={buildImageSrc(item.book.images[0])}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                          <span className="material-icons">menu_book</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between h-36 min-w-0">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/books/${item.book.id}`}>
                            <h3 className="text-lg font-bold hover:text-[#0404ae] cursor-pointer transition-colors block leading-tight mb-1">
                              {item.book.title}
                            </h3>
                          </Link>
                          <p className="text-slate-500 text-sm line-clamp-2">
                            {item.book.description}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                            In stock
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-slate-900 dark:text-white">
                            ${item.book.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#0404ae] hover:bg-white rounded transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <span className="material-icons text-sm">
                              remove
                            </span>
                          </button>
                          <span className="w-10 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#0404ae] hover:bg-white rounded transition-colors"
                            disabled={item.quantity >= item.book.stock}
                            title={
                              item.quantity >= item.book.stock
                                ? "No more stock available"
                                : "Increase quantity"
                            }
                          >
                            <span className="material-icons text-sm">add</span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1"
                        >
                          <span className="material-icons text-xs">delete</span>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {cart?.items && cart.items.length > 0 && (
            <div className="lg:w-[30%]">
              <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-[#0404ae]/10 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6 text-slate-900">
                    Order Summary
                  </h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Estimated Tax</span>
                      <span className="font-medium text-slate-900">
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Order Total</span>
                        <span className="text-2xl font-bold text-[#0404ae]">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full bg-[#0404ae] hover:bg-[#0404ae]/90 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 mb-4 group">
                    Proceed to Checkout
                    <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="material-icons text-slate-400">
                        local_shipping
                      </span>
                      <span className="text-xs text-slate-600">
                        Free shipping on orders over $100
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="material-icons text-slate-400">
                        security
                      </span>
                      <span className="text-xs text-slate-600">
                        Secure encrypted checkout
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0404ae]/5 p-4 border-t border-[#0404ae]/10">
                  <div className="flex items-center justify-center gap-4">
                    <span className="material-icons text-slate-400 text-lg">
                      payments
                    </span>
                    <span className="material-icons text-slate-400 text-lg">
                      credit_card
                    </span>
                    <span className="material-icons text-slate-400 text-lg">
                      account_balance_wallet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © 2026 Bookly. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link
              className="text-xs text-slate-400 no-underline hover:text-[#0404ae]"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs text-slate-400 no-underline hover:text-[#0404ae]"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-xs text-slate-400 no-underline hover:text-[#0404ae]"
              href="#"
            >
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
