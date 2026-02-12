"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  ShoppingCart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface Book {
  id: number;
  title: string;
  description: string;
  stock: number;
  price: number;
  images: string[];
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchBook(Number(params.id));
    }
  }, [params.id]);

  const fetchBook = async (id: number) => {
    try {
      const data = await apiClient.getBookById(id);
      setBook(data);
    } catch (error) {
      console.error("Failed to fetch book:", error);
      router.push("/books");
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (book && book.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % book.images.length);
    }
  };

  const prevImage = () => {
    if (book && book.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + book.images.length) % book.images.length,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
        <BookOpen className="h-12 w-12 text-[var(--navy)] animate-bounce" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-[var(--navy)] mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-2">
            Book not found
          </h2>
          <Link
            href="/books"
            className="text-[var(--navy)] hover:underline font-semibold"
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--navy)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link
              href="/books"
              className="flex-shrink-0 flex items-center gap-2"
            >
              <BookOpen className="h-8 w-8 text-[var(--navy)]" />
              <span className="text-2xl font-bold tracking-tight text-[var(--navy)] font-serif italic">
                Bookly
              </span>
            </Link>
            <Link
              href="/books"
              className="flex items-center gap-2 text-[var(--navy)] hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Books</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white shadow-lg">
              {book.images && book.images.length > 0 ? (
                <>
                  <img
                    src={`http://localhost:8000${book.images[currentImageIndex]}`}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  {book.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft className="h-6 w-6 text-[var(--navy)]" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight className="h-6 w-6 text-[var(--navy)]" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {book.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "bg-white w-8"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--beige)]/30">
                  <BookOpen className="h-24 w-24 text-[var(--charcoal)]/30" />
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {book.images && book.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {book.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-[var(--navy)] shadow-md"
                        : "border-transparent hover:border-[var(--navy)]/30"
                    }`}
                  >
                    <img
                      src={`http://localhost:8000${image}`}
                      alt={`${book.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-4 font-serif">
                {book.title}
              </h1>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5" />
                </div>
                <span className="text-sm text-[var(--charcoal)]/60">
                  (4.0) • 128 reviews
                </span>
              </div>
            </div>

            <div className="border-t border-b border-[var(--slate-200)] py-6">
              <div className="text-4xl font-bold text-[var(--navy)] mb-2">
                ${book.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={
                    book.stock > 0
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {book.stock > 0 ? `In Stock (${book.stock})` : "Out of Stock"}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--charcoal)] mb-3">
                Description
              </h2>
              <p className="text-[var(--charcoal)]/80 leading-relaxed">
                {book.description}
              </p>
            </div>

            <div className="space-y-4 pt-6">
              <button
                disabled={book.stock === 0}
                className="w-full bg-[var(--navy)] text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 hover:bg-[var(--navy)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <ShoppingCart className="h-6 w-6" />
                Add to Cart
              </button>
              <div className="grid grid-cols-2 gap-4 text-sm text-[var(--charcoal)]/70">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  30-day return policy
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
