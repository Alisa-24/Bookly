"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  ShoppingCart,
  User,
  LogOut,
  FilterX,
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

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsLoggedIn(!!token);
    if (token) {
      checkUserRole();
    }
    fetchBooks();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setIsAdmin(user.role === "admin");
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      const data = await apiClient.getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/login";
  };

  const resetFilters = () => {
    setSelectedGenre(null);
    setMinPrice(0);
    setSearchQuery("");
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get book cover URL - use first image or fallback to placeholder
  const getBookCoverUrl = (book: Book) => {
    if (book.images && book.images.length > 0) {
      return `http://localhost:8000${book.images[0]}`;
    }
    // Fallback placeholder images
    const placeholders = [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400&h=600&fit=crop",
    ];
    return placeholders[book.id % placeholders.length];
  };

  return (
    <div className="min-h-screen bg-[var(--off-white)] text-[var(--charcoal)]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--navy)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/books"
              className="flex-shrink-0 flex items-center gap-2"
            >
              <BookOpen className="h-8 w-8 text-[var(--navy)]" />
              <span className="text-2xl font-bold tracking-tight text-[var(--navy)] font-serif italic">
                Bookly
              </span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  className="w-full bg-[var(--beige)]/30 border-transparent focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] rounded-full px-5 py-2.5 pl-12 text-sm"
                  placeholder="Search by title..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-2.5 h-5 w-5 text-[var(--charcoal)]/40" />
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin/books"
                      className="text-sm text-[var(--navy)] hover:underline hidden sm:block"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-[var(--navy)]/10 text-[var(--navy)] px-4 py-2 rounded-full font-semibold hover:bg-[var(--navy)] hover:text-white transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-[var(--navy)]/10 text-[var(--navy)] px-4 py-2 rounded-full font-semibold hover:bg-[var(--navy)] hover:text-white transition-all"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="relative rounded-xl overflow-hidden mb-12 bg-[var(--navy)]/5 border border-[var(--navy)]/10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16">
              <span className="inline-block px-3 py-1 bg-[var(--navy)] text-white text-xs font-bold rounded-full mb-6 tracking-widest uppercase">
                Featured Collection
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight font-serif">
                Discover Your Next Favorite Book
              </h1>
              <p className="text-[var(--charcoal)]/70 text-lg mb-8 max-w-md italic">
                Explore our curated collection of timeless classics and modern
                masterpieces.
              </p>
            </div>
            <div className="w-full md:w-1/2 relative min-h-[400px]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX36MyuKgCQviiGElt-h9E5vz_Xn9D6xtlrpqClJhZMHHTVCFTuOSpxhIYO2g-JT6Uj9fa0xIRqMpBV9wV9ZfuGDfkWD6g4lJRtfxBRLPAhO6u-qVUr93UvrOGOCOw0PCloMh2H2nb-vX4BfLrkMHSO-I_WgjUM4Kg7E3Um0cyR7rZXBAvC2uP91xiko7DKqaOHaqfzbyyib5h5MWcvTbtM9ZL2vofpoOcZ4bbVE2TpVF_1D5S8OAKmMlwUY5TprYLpW39fNXLCEbh"
                alt="The Midnight Library Book Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)]/5 to-transparent"></div>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-8 flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FilterX className="h-5 w-5 text-[var(--navy)]" />
                Filters
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedGenre === null
                      ? "bg-[var(--navy)]/10 text-[var(--navy)] font-semibold"
                      : "hover:bg-[var(--beige)]/30"
                  }`}
                >
                  All Books
                </button>
                <button
                  onClick={() => setSelectedGenre("fiction")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedGenre === "fiction"
                      ? "bg-[var(--navy)]/10 text-[var(--navy)] font-semibold"
                      : "hover:bg-[var(--beige)]/30"
                  }`}
                >
                  Fiction
                </button>
                <button
                  onClick={() => setSelectedGenre("non-fiction")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedGenre === "non-fiction"
                      ? "bg-[var(--navy)]/10 text-[var(--navy)] font-semibold"
                      : "hover:bg-[var(--beige)]/30"
                  }`}
                >
                  Non-Fiction
                </button>
                <button
                  onClick={() => setSelectedGenre("mystery")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedGenre === "mystery"
                      ? "bg-[var(--navy)]/10 text-[var(--navy)] font-semibold"
                      : "hover:bg-[var(--beige)]/30"
                  }`}
                >
                  Mystery
                </button>
                <button
                  onClick={() => setSelectedGenre("sci-fi")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedGenre === "sci-fi"
                      ? "bg-[var(--navy)]/10 text-[var(--navy)] font-semibold"
                      : "hover:bg-[var(--beige)]/30"
                  }`}
                >
                  Science Fiction
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Ratings</h3>
              <div className="space-y-2">
                <button className="flex items-center gap-2 w-full text-left hover:bg-[var(--navy)]/5 p-2 rounded transition-colors">
                  <div className="flex text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-[var(--charcoal)]/60">
                    & Up
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--slate-200)]">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 text-[var(--charcoal)]/60 hover:text-[var(--navy)] transition-colors text-sm"
              >
                <FilterX className="h-4 w-4" />
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Book Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-[var(--charcoal)]/70">
                Showing{" "}
                <span className="font-bold text-[var(--charcoal)]">
                  {filteredBooks.length}
                </span>{" "}
                books
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--charcoal)]/60">
                  Sort by:
                </span>
                <select className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer">
                  <option>Popularity</option>
                  <option>Newest</option>
                  <option>Title A-Z</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <BookOpen className="h-12 w-12 text-[var(--navy)] animate-bounce" />
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="bg-white rounded-lg border border-[var(--slate-200)] p-12 text-center">
                <BookOpen className="h-16 w-16 text-[var(--navy)] mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-2">
                  No books found
                </h3>
                <p className="text-[var(--charcoal)] opacity-75">
                  {searchQuery
                    ? "Try a different search term"
                    : "Check back soon for new additions"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="group flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-all duration-300">
                      <img
                        src={getBookCoverUrl(book)}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <div className="p-3 bg-white text-[var(--navy)] rounded-full">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      </div>
                      {book.images && book.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-[var(--navy)] text-white px-2 py-1 rounded-full text-xs font-semibold">
                          +{book.images.length - 1} more
                        </div>
                      )}
                    </div>
                    <h4 className="text-lg font-bold line-clamp-1 font-serif">
                      {book.title}
                    </h4>
                    <p className="text-[var(--charcoal)]/60 text-sm mb-2 line-clamp-2 italic">
                      {book.description}
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] text-[var(--charcoal)]/40 font-bold">
                        (4.0)
                      </span>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-[var(--navy)]">
                          ${book.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-[var(--charcoal)]/60">
                          Stock: {book.stock}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-[var(--slate-200)] bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-8 w-8 text-[var(--navy)]" />
                <span className="text-2xl font-bold tracking-tight text-[var(--navy)] font-serif italic">
                  Bookly
                </span>
              </div>
              <p className="text-[var(--charcoal)]/60 max-w-sm mb-8 italic">
                Your gateway to thousands of worlds, curated for the modern
                reader who values both style and substance.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-[var(--charcoal)]/60 text-sm">
                <li>
                  <a
                    className="hover:text-[var(--navy)] transition-colors"
                    href="#"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[var(--navy)] transition-colors"
                    href="#"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-[var(--charcoal)]/60 text-sm">
                <li>
                  <a
                    className="hover:text-[var(--navy)] transition-colors"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-[var(--navy)] transition-colors"
                    href="#"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[var(--slate-100)] text-center text-[var(--charcoal)]/40 text-xs">
            © 2026 Bookly. Designed for literary lovers.
          </div>
        </div>
      </footer>
    </div>
  );
}
