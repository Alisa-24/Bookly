"use client";

import { useEffect, useRef, useState } from "react";
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
import { apiClient, clearAuthTokens, getAccessToken } from "@/lib/api";
import { cartApi } from "@/lib/api/cart";
import { reviewsApi, Review } from "@/lib/api/reviews";
import Toast from "@/components/Toast";

interface Book {
  id: number;
  title: string;
  description: string;
  stock: number;
  price: number;
  images: string[];
  reviews: Review[];
  average_rating: number;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBook(Number(params.id));
    }
  }, [params.id]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  };

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    const token = getAccessToken();
    if (!token) {
      showToast("Please login to write a review", "error");
      return;
    }

    if (newRating < 1 || newRating > 5) {
      showToast("Please select a rating between 1 and 5", "error");
      return;
    }

    if (!newComment.trim()) {
      showToast("Please write a comment", "error");
      return;
    }

    try {
      setIsSubmittingReview(true);
      await reviewsApi.createReview({
        book_id: book.id,
        rating: newRating,
        comment: newComment,
      });
      showToast("Review submitted successfully!", "success");
      setNewComment("");
      setNewRating(5);
      fetchBook(book.id); // Refresh book data to show new review
    } catch (err: any) {
      showToast(err.message || "Failed to submit review", "error");
    } finally {
      setIsSubmittingReview(false);
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
            <div className="flex items-center gap-4">
              <Link
                href="/cart"
                className="relative p-2 text-[var(--navy)] hover:bg-[var(--navy)]/10 rounded-full transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-6 w-6" />
              </Link>
            </div>
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
              <div className="flex items-center gap-3 mb-6">
                {book.average_rating > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(book.average_rating || 0)
                                ? "fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-lg text-[var(--charcoal)] ml-1">
                        {(book.average_rating || 0).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--charcoal)]/60">
                      • {book.reviews?.length || 0} reviews
                    </span>
                  </>
                ) : (
                  <span className="text-sm px-3 py-1 bg-[var(--navy)]/5 text-[var(--navy)] rounded-full font-medium italic">
                    No ratings yet
                  </span>
                )}
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
                onClick={async () => {
                  // Check login
                  const token = getAccessToken();
                  if (!token) {
                    showToast(
                      "Please login to add items to your cart",
                      "error",
                    );
                    return;
                  }
                  try {
                    await cartApi.addItem(book.id, 1);
                    showToast("Added to cart!", "success");
                  } catch (err) {
                    if (
                      (err as { status?: number }).status === 401 ||
                      (err as { status?: number }).status === 403
                    ) {
                      showToast(
                        "Session expired. Please login again.",
                        "error",
                      );
                      clearAuthTokens();
                      return;
                    }
                    console.error(err);
                    showToast("Failed to add to cart", "error");
                  }
                }}
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

        {/* Reviews Section */}
        <div className="mt-20 pt-12 border-t border-[var(--navy)]/10">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Reviews List */}
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl font-bold font-serif mb-8">
                Customer Reviews
              </h2>

              {book.reviews && book.reviews.length > 0 ? (
                <div className="space-y-6">
                  {book.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-6 rounded-xl shadow-sm border border-[var(--navy)]/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex text-yellow-400 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-current"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="font-bold text-[var(--charcoal)]">
                            {review.user_name}
                          </p>
                        </div>
                        <span className="text-sm text-[var(--charcoal)]/40">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[var(--charcoal)]/80 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-16 rounded-2xl border-2 border-dashed border-[var(--navy)]/10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-[var(--navy)]/5 rounded-full flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-[var(--navy)]/20" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
                  <p className="text-[var(--charcoal)]/50 max-w-xs mx-auto italic">
                    Be the first to share your thoughts on "{book.title}" and
                    help others discover a great read!
                  </p>
                </div>
              )}
            </div>

            {/* Write a Review Form */}
            <div className="lg:w-96">
              <div className="sticky top-32 bg-white p-8 rounded-2xl shadow-xl border border-[var(--navy)]/10">
                <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                {localStorage.getItem("auth_token") ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= newRating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-[var(--charcoal)] mb-2"
                      >
                        Your Review
                      </label>
                      <textarea
                        id="comment"
                        rows={4}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--navy)]/10 focus:border-[var(--navy)] focus:ring-2 focus:ring-[var(--navy)]/20 transition-all resize-none"
                        placeholder="What did you think of the book?"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full bg-[var(--navy)] text-white py-4 rounded-xl font-bold hover:bg-[var(--navy)]/90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--navy)]/20 flex items-center justify-center gap-2"
                    >
                      {isSubmittingReview ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                          Submitting...
                        </>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[var(--charcoal)]/60 mb-6">
                      You must be logged in to write a review.
                    </p>
                    <Link
                      href="/login"
                      className="inline-block w-full py-4 px-6 bg-[var(--navy)]/5 text-[var(--navy)] rounded-xl font-bold hover:bg-[var(--navy)]/10 transition-all"
                    >
                      Login to Review
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
