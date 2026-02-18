export const API_BASE_URL = "http://localhost:8000";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const getStoredToken = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(key);
};

export const getAccessToken = () => getStoredToken(AUTH_TOKEN_KEY);
export const getRefreshToken = () => getStoredToken(REFRESH_TOKEN_KEY);

export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getHeaders = (requireAuth = false) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const clearAuthTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const formatErrorMessage = (detail: any): string => {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => e.msg || e.message || JSON.stringify(e))
      .join(", ");
  }
  if (typeof detail === "object" && detail !== null) {
    return JSON.stringify(detail);
  }
  return "Unknown error";
};

const mergeHeaders = (
  headers: HeadersInit | undefined,
  requireAuth: boolean,
  isFormData: boolean = false,
  hasBody: boolean = false,
) => {
  const merged = new Headers(headers);

  // For FormData requests, don't set Content-Type and let the browser set it with boundary
  if (isFormData) {
    merged.delete("Content-Type");
  } else if (hasBody && !merged.has("Content-Type")) {
    // For non-FormData requests with a body, ensure Content-Type is application/json
    merged.set("Content-Type", "application/json");
  }

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      merged.set("Authorization", `Bearer ${token}`);
    }
  }

  return merged;
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/auth/jwt/refresh`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearAuthTokens();
    return false;
  }

  const data = await response.json();
  if (data.access_token) {
    setAuthTokens(data.access_token, data.refresh_token);
    return true;
  }

  clearAuthTokens();
  return false;
};

export const fetchWithAuth = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  requireAuth = false,
  retry = true,
): Promise<Response> => {
  const isFormData = init.body instanceof FormData;
  const hasBody = init.body !== undefined && init.body !== null;

  const config: RequestInit = {
    ...init,
    headers: mergeHeaders(init.headers, requireAuth, isFormData, hasBody),
  };

  const response = await fetch(input, config);

  if (!requireAuth || response.status !== 401 || !retry) {
    return response;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    return response;
  }

  const retryConfig: RequestInit = {
    ...init,
    headers: mergeHeaders(init.headers, requireAuth, isFormData, hasBody),
  };

  return fetch(input, retryConfig);
};

export const apiClient = {
  async login(email: string, password: string) {
    // FastAPI Users expects form data, not JSON
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(
      `${API_BASE_URL}/auth/jwt/login-with-refresh`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(formatErrorMessage(error.detail) || "Login failed");
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
      throw new Error(
        formatErrorMessage(error.detail) || "Registration failed",
      );
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
      throw new Error(
        formatErrorMessage(error.detail) || "Google authentication failed",
      );
    }

    return response.json();
  },

  async logout() {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/auth/logout`,
      {
        method: "POST",
      },
      true,
      false,
    );

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    clearAuthTokens();
    return response.json();
  },

  async getCurrentUser() {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/users/me`,
      {
        method: "GET",
      },
      true,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }

    return response.json();
  },

  async getBooks() {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    return response.json();
  },

  async getBookById(id: number) {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "GET",
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

    // Ensure token is fresh before upload
    await refreshAccessToken();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("stock", stock.toString());
    formData.append("price", price.toString());
    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await fetchWithAuth(
      `${API_BASE_URL}/books`,
      {
        method: "POST",
        body: formData,
      },
      true,
      false,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        formatErrorMessage(error.detail) || "Failed to create book",
      );
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
    keep_images: string[] = [],
  ) {
    const totalImages = images.length + keep_images.length;
    if (totalImages < 1 || totalImages > 4) {
      throw new Error("Books must have between 1 and 4 images total");
    }

    // Ensure token is fresh before upload
    await refreshAccessToken();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("stock", stock.toString());
    formData.append("price", price.toString());
    formData.append("keep_images", JSON.stringify(keep_images));

    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await fetchWithAuth(
      `${API_BASE_URL}/books/${id}`,
      {
        method: "PUT",
        body: formData,
      },
      true,
      false,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        formatErrorMessage(error.detail) || "Failed to update book",
      );
    }

    return response.json();
  },

  async deleteBook(id: number) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/books/${id}`,
      {
        method: "DELETE",
      },
      true,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        formatErrorMessage(error.detail) || "Failed to delete book",
      );
    }

    return response.json();
  },
};
