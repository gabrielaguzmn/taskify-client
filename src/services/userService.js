import { http } from "../api/http.js";

/**
 * Register a new user
 */
export async function registerUser({ name, lastName, age, email, password }) {
  const res = await http.post("/users/register", { name, lastName, age, email, password });
  return res;
}

/**
 * Login user and persist in localStorage
 */
export async function loginUser({ email, password }) {
  const res = await http.post("/users/login", { email, password });

  if (res.user) {
    localStorage.setItem("currentUser", JSON.stringify(res.user));
    localStorage.setItem("isLoggedIn", "true");
    if (res.token) {
      localStorage.setItem("authToken", res.token);
    }
  }
  return res;
}

/**
 * Password recovery
 */
export async function recoverPassword({ email }) {
  const res = await http.post("/users/recover", { email });
  return res;
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("Error parsing user data:", err);
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

/**
 * Logout
 */
export function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("authToken");
  location.hash = "#/login";
}