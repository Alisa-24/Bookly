export const API_BASE_URL = "http://localhost:8000";

export const getHeaders = (requireAuth = false) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const apiClient = {
  async login(email: string, password: string) {
    // FastAPI Users expects form data, not JSON
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle both string and array error details
      if (Array.isArray(error.detail)) {
        const messages = error.detail
          .map((e: any) => e.msg || e.message || JSON.stringify(e))
          .join(", ");
        throw new Error(messages || "Login failed");
      }
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        email,
        password,
        full_name: name || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle both string and array error details
      if (Array.isArray(error.detail)) {
        const messages = error.detail
          .map((e: any) => e.msg || e.message || JSON.stringify(e))
          .join(", ");
        throw new Error(messages || "Registration failed");
      }
      throw new Error(error.detail || "Registration failed");
    }

    return response.json();
  },

  async googleCallback(code: string) {
    const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Google authentication failed");
    }

    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    localStorage.removeItem("auth_token");
    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }

    return response.json();
  },

  async getBooks() {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    return response.json();
  },

  async getBookById(id: number) {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch book");
    }

    return response.json();
  },

  async createBook(
    title: string,
    description: string,
    stock: number,
    price: number,
    images: File[],
  ) {
    if (images.length < 1 || images.length > 4) {
      throw new Error("You must upload between 1 and 4 images");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("stock", stock.toString());
    formData.append("price", price.toString());
    images.forEach((image) => {
      formData.append("images", image);
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create book");
    }

    return response.json();
  },

  async updateBook(
    id: number,
    title: string,
    description: string,
    stock: number,
    price: number,
    images: File[],
  ) {
    if (images.length < 1 || images.length > 4) {
      throw new Error("You must upload between 1 and 4 images");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("stock", stock.toString());
    formData.append("price", price.toString());
    images.forEach((image) => {
      formData.append("images", image);
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update book");
    }

    return response.json();
  },

  async deleteBook(id: number) {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete book");
    }

    return response.json();
  },
};
