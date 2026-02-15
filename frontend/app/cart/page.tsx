"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cartApi, Cart } from "@/lib/api/cart";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import CheckoutButton from "@/components/CheckoutButton";
import Footer from "@/components/Footer";

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--off-white)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--navy)]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--off-white)] text-[var(--charcoal)]">
      <SiteHeader
        cartCount={itemCount}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <Link
            href="/books"
            className="inline-flex items-center text-[var(--navy)] font-medium no-underline hover:text-[var(--navy)]/80 transition-all"
          >
            <span className="material-icons text-sm mr-2">arrow_back</span>
            Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[70%]">
            <div className="flex justify-between items-end mb-6">
              <h1 className="text-3xl font-bold font-serif">
                Your Shopping Cart
              </h1>
              <span className="text-[var(--charcoal)]/60 font-medium">
                {itemCount} items in your bag
              </span>
            </div>

            <div className="space-y-1">
              {cart?.items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-[var(--navy)]/10">
                  <span className="material-icons text-6xl text-[var(--charcoal)]/20 mb-4">
                    shopping_bag
                  </span>
                  <h2 className="text-xl font-semibold mb-2 font-serif">
                    Your cart is empty
                  </h2>
                  <p className="text-[var(--charcoal)]/60 mb-6">
                    Looks like you haven't added any books yet.
                  </p>
                  <Link
                    href="/books"
                    className="px-6 py-2 bg-[var(--navy)] text-white rounded-lg hover:bg-[var(--navy)]/90 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                cart?.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-[var(--navy)]/10 flex gap-6 items-start transition-all hover:shadow-md"
                  >
                    <div className="w-24 h-36 bg-[var(--beige)]/30 rounded overflow-hidden flex-shrink-0">
                      {item.book.images?.[0] ? (
                        <img
                          src={buildImageSrc(item.book.images[0])}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--beige)]/50 text-[var(--charcoal)]/40">
                          <span className="material-icons">menu_book</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between h-36 min-w-0">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/books/${item.book.id}`}>
                            <h3 className="text-lg font-bold hover:text-[var(--navy)] cursor-pointer transition-colors block leading-tight mb-1 font-serif">
                              {item.book.title}
                            </h3>
                          </Link>
                          <p className="text-[var(--charcoal)]/60 text-sm line-clamp-2">
                            {item.book.description}
                          </p>
                          <p className="text-xs text-[var(--charcoal)]/40 mt-1 uppercase tracking-wider">
                            In stock
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-[var(--charcoal)]">
                            ${item.book.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center bg-[var(--beige)]/30 rounded-lg border border-[var(--navy)]/10 p-1">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[var(--navy)] hover:bg-white rounded transition-colors disabled:opacity-50"
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
                            className="w-8 h-8 flex items-center justify-center text-[var(--navy)] hover:bg-white rounded transition-colors"
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
              <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-[var(--navy)]/10 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6 text-[var(--charcoal)] font-serif">
                    Order Summary
                  </h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-[var(--charcoal)]/60">
                      <span>Subtotal</span>
                      <span className="font-medium text-[var(--charcoal)]">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[var(--charcoal)]/60">
                      <span>Estimated Tax</span>
                      <span className="font-medium text-[var(--charcoal)]">
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-[var(--navy)]/10">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Order Total</span>
                        <span className="text-2xl font-bold text-[var(--navy)]">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CheckoutButton
                    cartId={cart?.id || 0}
                    total={total}
                    disabled={!isLoggedIn || cart?.items.length === 0}
                  />
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-[var(--beige)]/30 rounded-lg">
                      <span className="material-icons text-[var(--charcoal)]/40">
                        local_shipping
                      </span>
                      <span className="text-xs text-[var(--charcoal)]/60">
                        Free shipping on orders over $100
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[var(--beige)]/30 rounded-lg">
                      <span className="material-icons text-[var(--charcoal)]/40">
                        security
                      </span>
                      <span className="text-xs text-[var(--charcoal)]/60">
                        Secure encrypted checkout
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--navy)]/5 p-4 border-t border-[var(--navy)]/10">
                  <div className="flex items-center justify-center gap-4">
                    <span className="material-icons text-[var(--charcoal)]/40 text-lg">
                      payments
                    </span>
                    <span className="material-icons text-[var(--charcoal)]/40 text-lg">
                      credit_card
                    </span>
                    <span className="material-icons text-[var(--charcoal)]/40 text-lg">
                      account_balance_wallet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
