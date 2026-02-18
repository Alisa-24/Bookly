"use client";

import { useEffect, useState } from "react";
import { BookOpen, LogOut, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient, clearAuthTokens, getAccessToken } from "@/lib/api";
import Modal from "@/components/Modal";
import ConfirmModal from "@/components/ConfirmModal";
import SiteHeader from "@/components/SiteHeader";
import Toast from "@/components/Toast";

interface Book {
  id: number;
  title: string;
  description: string;
  stock: number;
  price: number;
  images: string[];
}

export default function AdminBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stock: 1,
    price: 0,
  });
  const [selectedImages, setSelectedImages] = useState<
    {
      file?: File;
      url: string;
      isExisting: boolean;
    }[]
  >([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    bookId: number | null;
  }>({ show: false, bookId: null });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    // Check if user is logged in
    const token = getAccessToken();
    if (!token) {
      localStorage.setItem(
        "pending_toast",
        JSON.stringify({
          message: "Access denied. Please login.",
          type: "error",
        }),
      );
      router.push("/login");
      return;
    }

    // Verify user has admin role
    try {
      const user = await apiClient.getCurrentUser();
      if (user.role !== "admin") {
        localStorage.setItem(
          "pending_toast",
          JSON.stringify({
            message: "Access denied. Admin privileges required.",
            type: "error",
          }),
        );
        router.push("/books");
        return;
      }
      setIsLoggedIn(true);
      setIsAdmin(true);
      setIsCheckingAuth(false);
      fetchBooks();
      fetchCartCount();
    } catch (error) {
      console.error("Failed to verify admin access:", error);
      localStorage.setItem(
        "pending_toast",
        JSON.stringify({
          message: "Access denied. Session expired.",
          type: "error",
        }),
      );
      router.push("/books");
      return;
    }
  };

  const fetchCartCount = async () => {
    try {
      // Import cartApi dynamically if needed or use a shared state/context
      // For now, let's assume we can import it or it's available
      const { cartApi } = await import("@/lib/api/cart");
      const cart = await cartApi.getCart();
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
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
    clearAuthTokens();
    window.location.href = "/login";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedImages.length < 1 || selectedImages.length > 4) {
      alert("Please provide between 1 and 4 images");
      return;
    }

    const newFiles = selectedImages
      .filter((img) => !img.isExisting && img.file)
      .map((img) => img.file as File);

    const keep_images = selectedImages
      .filter((img) => img.isExisting)
      .map((img) => {
        const url = new URL(img.url);
        return url.pathname;
      });

    try {
      if (editingBook) {
        await apiClient.updateBook(
          editingBook.id,
          formData.title,
          formData.description,
          formData.stock,
          formData.price,
          newFiles,
          keep_images,
        );
      } else {
        await apiClient.createBook(
          formData.title,
          formData.description,
          formData.stock,
          formData.price,
          newFiles,
        );
      }
      handleCancel();
      fetchBooks();
    } catch (error: any) {
      alert(error.message || "Operation failed");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (selectedImages.length + files.length > 4) {
      alert("Maximum 4 images allowed total");
      e.target.value = "";
      return;
    }

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    e.target.value = ""; // Clear input for next selection
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      if (!newImages[index].isExisting) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      description: book.description,
      stock: book.stock,
      price: book.price,
    });

    if (book.images && book.images.length > 0) {
      setSelectedImages(
        book.images.map((img) => ({
          url: img.startsWith("http") ? img : `http://localhost:8000${img}`,
          isExisting: true,
        })),
      );
    } else {
      setSelectedImages([]);
    }
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirm({ show: true, bookId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.bookId) return;

    try {
      await apiClient.deleteBook(deleteConfirm.bookId);
      fetchBooks();
    } catch (error: any) {
      alert(error.message || "Failed to delete book");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormData({ title: "", description: "", stock: 1, price: 0 });
    // Revoke blob URLs to prevent memory leaks
    selectedImages.forEach((img) => {
      if (!img.isExisting) URL.revokeObjectURL(img.url);
    });
    setSelectedImages([]);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-[var(--navy)] mx-auto mb-4 animate-bounce" />
          <p className="text-[var(--charcoal)]">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      {/* Header */}
      <SiteHeader
        cartCount={cartCount}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold text-[var(--charcoal)] mb-2">
              Manage Books
            </h2>
            <p className="text-lg text-[var(--charcoal)] opacity-75">
              Add, edit, or remove books from your collection
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--navy)] text-[var(--off-white)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Add New Book
          </button>
        </div>

        {/* Books Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <BookOpen className="h-12 w-12 text-[var(--navy)] animate-bounce" />
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-lg border border-[var(--slate-200)] p-12 text-center">
            <BookOpen className="h-16 w-16 text-[var(--navy)] mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-2">
              No books yet
            </h3>
            <p className="text-[var(--charcoal)] opacity-75 mb-6">
              Start building your collection by adding your first book
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[var(--slate-200)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--beige)]/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--charcoal)]">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--charcoal)]">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--charcoal)]">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--charcoal)]">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--charcoal)]">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--charcoal)]">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--charcoal)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--slate-200)]">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[var(--beige)]/10">
                    <td className="px-6 py-4 text-sm text-[var(--charcoal)]">
                      {book.id}
                    </td>
                    <td className="px-6 py-4">
                      {book.images && book.images.length > 0 ? (
                        <div className="flex gap-1">
                          <img
                            src={`http://localhost:8000${book.images[0]}`}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded border border-[var(--slate-200)]"
                          />
                          {book.images.length > 1 && (
                            <span className="flex items-center text-xs text-[var(--charcoal)]/60">
                              +{book.images.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-16 bg-[var(--beige)]/30 rounded border border-[var(--slate-200)] flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-[var(--charcoal)]/30" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--charcoal)]">
                      {book.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--charcoal)]/70 max-w-md truncate">
                      {book.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[var(--navy)]">
                      ${book.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--charcoal)]">
                      {book.stock}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-2 text-[var(--navy)] hover:bg-[var(--navy)]/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingBook ? "Edit Book Details" : "Add New Book to Collection"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="p-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--navy)]/50 pb-2 border-b border-[var(--navy)]/10">
                  Book Information
                </h4>
                <div>
                  <label className="block text-sm font-semibold text-[var(--charcoal)] mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter book title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[var(--beige)]/20 border border-[var(--slate-200)] rounded-xl focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--charcoal)] mb-1.5">
                    Description
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide a detailed description of the book..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[var(--beige)]/20 border border-[var(--slate-200)] rounded-xl focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] outline-none transition-all font-medium resize-none text-sm leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--charcoal)] mb-1.5">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-[var(--beige)]/20 border border-[var(--slate-200)] rounded-xl focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] outline-none transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--charcoal)] mb-1.5">
                      Inventory (Stock)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-[var(--beige)]/20 border border-[var(--slate-200)] rounded-xl focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] outline-none transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Images */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--navy)]/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--navy)]/50">
                    Book Covers ({selectedImages.length}/4)
                  </h4>
                  <span className="text-[10px] text-red-500 font-bold uppercase">
                    Required: 1-4
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {selectedImages.map((img, index) => (
                    <div
                      key={index}
                      className="group relative aspect-[3/4] bg-[var(--beige)]/10 rounded-xl overflow-hidden border border-[var(--slate-200)] shadow-sm"
                    >
                      <img
                        src={img.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-2 py-0.5 bg-white/90 text-[var(--navy)] text-[8px] font-black uppercase rounded shadow-sm">
                          {img.isExisting ? "Existing" : "New"}
                        </span>
                      </div>
                    </div>
                  ))}

                  {selectedImages.length < 4 && (
                    <label className="cursor-pointer group relative aspect-[3/4] border-2 border-dashed border-[var(--slate-200)] hover:border-[var(--navy)]/30 rounded-xl flex flex-col items-center justify-center gap-2 bg-[var(--beige)]/5 hover:bg-[var(--navy)]/5 transition-all">
                      <div className="p-3 bg-white rounded-full shadow-sm text-[var(--navy)]/50 group-hover:text-[var(--navy)] transition-colors">
                        <Plus className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-[var(--navy)]/40 group-hover:text-[var(--navy)]/60">
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-[10px] text-[var(--charcoal)]/50 italic leading-relaxed">
                  Tip: Drag and drop not supported yet. Select high-quality
                  portrait images for best results.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--slate-200)] flex gap-4">
            <button
              onClick={handleCancel}
              type="button"
              className="px-8 py-3 bg-[var(--off-white)] text-[var(--charcoal)]/70 rounded-xl font-bold hover:bg-[var(--slate-100)] hover:text-[var(--charcoal)] transition-all flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[var(--navy)] text-white rounded-xl font-bold hover:brightness-110 hover:shadow-lg transition-all flex-[2] flex items-center justify-center gap-2"
            >
              {editingBook ? (
                <>
                  <Edit className="h-4 w-4" />
                  Update Book Details
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Book to Catalog
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, bookId: null })}
        onConfirm={confirmDelete}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
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
