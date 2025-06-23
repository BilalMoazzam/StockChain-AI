const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api"

const getToken = () => localStorage.getItem("authToken")

const request = async (url, method = "GET", data = null) => {
  const headers = {
    "Content-Type": "application/json",
  }

  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const config = {
    method,
    headers,
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Something went wrong")
    }
    return response.json()
  } catch (error) {
    console.error("API Request Error:", error)
    throw error
  }
}

export const authService = {
  login: (credentials) => request("/auth/login", "POST", credentials),
  register: (userData) => request("/auth/register", "POST", userData),
  // Add other auth related calls as needed
}

export const userService = {
  getUsers: () => request("/users"),
  getUserById: (id) => request(`/users/${id}`),
  createUser: (userData) => request("/users", "POST", userData),
  updateUser: (id, userData) => request(`/users/${id}`, "PUT", userData),
  deleteUser: (id) => request(`/users/${id}`, "DELETE"),
}

export const productService = {
  getProducts: () => request("/products"),
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (productData) => request("/products", "POST", productData),
  updateProduct: (id, productData) => request(`/products/${id}`, "PUT", productData),
  deleteProduct: (id) => request(`/products/${id}`, "DELETE"),
}

export const orderService = {
  getOrders: () => request("/orders"),
  getOrderById: (id) => request(`/orders/${id}`),
  createOrder: (orderData) => request("/orders", "POST", orderData),
  updateOrder: (id, orderData) => request(`/orders/${id}`, "PUT", orderData),
  deleteOrder: (id) => request(`/orders/${id}`, "DELETE"),
}

export const blockchainService = {
  getTransactions: () => request("/blockchain/transactions"),
  getTransactionById: (id) => request(`/blockchain/transactions/${id}`),
  // Add other blockchain related calls if needed
}
