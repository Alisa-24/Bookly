const API_BASE_URL = "http://localhost:8000";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface Review {
  id: number;
  book_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewCreate {
  book_id: number;
  rating: number;
  comment: string;
}

export const reviewsApi = {
  // Get reviews for a book
  async getBookReviews(bookId: number): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/reviews/book/${bookId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch reviews");
    }

    return response.json();
  },

  // Create a review
  async createReview(data: ReviewCreate): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to submit review");
    }

    return response.json();
  },

  // Delete a review
  async deleteReview(reviewId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete review");
    }
  },
};
