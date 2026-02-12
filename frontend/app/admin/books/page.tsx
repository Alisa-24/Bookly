"use client";

import { useEffect, useState } from "react";
import { BookOpen, LogOut, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import Modal from "@/components/Modal";
import ConfirmModal from "@/components/ConfirmModal";

interface Book {
  id: number;
  title: string;
  description: string;
  stock: number;
  price: number;
  images: string[];
}

export default function AdminBooksPage() {
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    bookId: number | null;
  }>({ show: false, bookId: null });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Verify user has admin role
    try {
      const user = await apiClient.getCurrentUser();
      if (user.role !== "admin") {
        alert("Access denied. Admin privileges required.");
        window.location.href = "/books";
        return;
      }
      setIsCheckingAuth(false);
      fetchBooks();
    } catch (error) {
      console.error("Failed to verify admin access:", error);
      window.location.href = "/login";
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
    window.location.href = "/login";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate images count (1-4)
    if (selectedImages.length < 1 || selectedImages.length > 4) {
      alert("Please select between 1 and 4 images");
      return;
    }

    try {
      if (editingBook) {
        await apiClient.updateBook(
          editingBook.id,
          formData.title,
          formData.description,
          formData.stock,
          formData.price,
          selectedImages,
        );
      } else {
        await apiClient.createBook(
          formData.title,
          formData.description,
          formData.stock,
          formData.price,
          selectedImages,
        );
      }
      setFormData({ title: "", description: "", stock: 1, price: 0 });
      setSelectedImages([]);
      setImagePreviews([]);
      setShowForm(false);
      setEditingBook(null);
      fetchBooks();
    } catch (error: any) {
      alert(error.message || "Operation failed");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length < 1 || files.length > 4) {
      alert("Please select between 1 and 4 images");
      e.target.value = "";
      return;
    }

    setSelectedImages(files);

    // Create previews for all selected files
    const previews: string[] = [];
    let loadedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        loadedCount++;
        if (loadedCount === files.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
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
    setSelectedImages([]);
    if (book.images && book.images.length > 0) {
      setImagePreviews(book.images.map((img) => `http://localhost:8000${img}`));
    } else {
      setImagePreviews([]);
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
    setSelectedImages([]);
    setImagePreviews([]);
  };

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
      <header className="bg-[var(--navy)] text-[var(--off-white)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-3xl font-bold font-serif">Bookly Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/books"
              className="px-4 py-2 rounded-lg bg-[var(--beige)] text-[var(--navy)] font-semibold hover:bg-[var(--off-white)] transition-colors"
            >
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--off-white)] text-[var(--navy)] font-semibold hover:bg-[var(--beige)] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

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
                {books.map((book) => (
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

      {/* Add/Edit Book Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingBook ? "Edit Book" : "Add New Book"}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-[var(--slate-200)] rounded-lg focus:ring-2 focus:ring-[var(--navy)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
                Price
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
                className="w-full px-4 py-2 border border-[var(--slate-200)] rounded-lg focus:ring-2 focus:ring-[var(--navy)] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-[var(--slate-200)] rounded-lg focus:ring-2 focus:ring-[var(--navy)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
              Stock
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
              className="w-full px-4 py-2 border border-[var(--slate-200)] rounded-lg focus:ring-2 focus:ring-[var(--navy)] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
              Book Cover Images (1-4 required){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              required={selectedImages.length === 0}
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-[var(--slate-200)] rounded-lg focus:ring-2 focus:ring-[var(--navy)] focus:border-transparent"
            />
            <p className="text-xs text-[var(--charcoal)]/60 mt-1">
              Select 1-4 images. Hold Ctrl/Cmd to select multiple files.
            </p>
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-[var(--slate-200)]"
                    />
                    <span className="absolute top-2 left-2 bg-[var(--navy)] text-white px-2 py-1 rounded text-xs">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-4 border-t border-[var(--slate-200)]">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[var(--navy)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              {editingBook ? "Update Book" : "Add Book"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-[var(--slate-200)] text-[var(--charcoal)] rounded-lg font-semibold hover:bg-[var(--slate-300)] transition-colors"
            >
              Cancel
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
    </div>
  );
}
