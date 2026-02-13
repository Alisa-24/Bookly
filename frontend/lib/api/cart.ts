import { API_BASE_URL, getHeaders } from "../api";

export interface Book {
  id: number;
  title: string;
  description: string;
  stock: number;
  price: number;
  images: string[];
}

export interface CartItem {
  id: number;
  cart_id: number;
  book_id: number;
  quantity: number;
  added_at: string;
  book: Book;
}

export interface Cart {
  id: number;
  user_id: number;
  created_at: string;
  items: CartItem[];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getHeaders(true) as HeadersInit; // Cart always requires auth for now

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    const message = error.detail || "API request failed";
    const apiError = new Error(message) as Error & { status?: number };
    apiError.status = response.status;
    throw apiError;
  }

  return response.json();
}

export const cartApi = {
  getCart: async () => {
    return request<Cart>("/cart/");
  },

  addItem: async (bookId: number, quantity: number = 1) => {
    return request<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ book_id: bookId, quantity }),
    });
  },

  updateItem: async (itemId: number, quantity: number) => {
    return request<Cart>(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (itemId: number) => {
    return request<Cart>(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  },
};
