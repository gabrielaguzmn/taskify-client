import { http } from "../api/http.js";
import { showToast } from "./toastService.js";


/**
 * Register a new user in the system.
 *
 * @async
 * @function registerUser
 * @param {Object} params - User registration data.
 * @param {string} params.firstName - The first name of the user.
 * @param {string} params.lastName - The last name of the user.
 * @param {number} params.age - The age of the user.
 * @param {string} params.email - The email of the user.
 * @param {string} params.password - The password of the user.
 * @returns {Promise<Object>} The created user object returned by the API.
 * @throws {Error} If the API responds with an error.
 */

export async function registerUser({ name, lastName, age, email, password }) {
  try {
    const response = await http.post("/api/users/register", { name, lastName, age, email, password });

    showToast("Successfully created account", "success", 5000);

    setTimeout(() => {
      location.hash = "#/login";
    }, 400);

    return response;
  } catch (err) {
        showToast("Error creating account", "error");

    const status = err.response?.status;
    const backendMessage = err.response?.data?.message;
    console.log(status)
    if (status >= 500) {
      showToast("Intenta de nuevo más tarde", "error", 5000);
    } else {
      showToast(backendMessage || err.message || "Error creating account", "error");
    }

    throw err;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const response = await http.put("/api/users/changePassword", { token, newPassword })

    showToast("Successfully changed password", "success")


    setTimeout(() => {
      location.hash = "#/login";
    }, 5000);

    return response;
  } catch (err) {
    showToast("Error changing password", "error");
    throw err;
  }
}

/**
 * Login a user into the system.
 *
 * @async
 * @function loginUser
 * @param {Object} params - User login data.
 * @param {string} params.email - The email of the user.
 * @param {string} params.password - The password of the user.
 * @returns {Promise<Object>} The auth token and user info returned by the API.
 * @throws {Error} If the API responds with an error.
 */
export async function loginUser({ email, password }) {
  try {
    const res = await http.post("/api/users/login", { email, password });
    if (res.token) {
      const user = decodeJWT(res.token);

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("authToken", res.token);
        // console.log("User saved to localStorage:", user); // ✅ Debug log


        showToast("Successfully logged in", "success", 5000);
        return res
      }
      else {
        throw new Error("Invalid token format")
      }
    } else {
      throw new Error("No token received from server");
    }
  } catch (err) {
    console.error("Login error:", err);

    if (err.status >= 500) {
      showToast("Intenta de nuevo más tarde", "error");
    } else {
      showToast(err.message || "Error al iniciar sesión", "error");
    }
    throw err;
  }
}

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));

    // Return user object from token payload
    return {
      id: decoded.id || decoded.userId || decoded._id,
      email: decoded.email,
      // Add other fields your token contains
    };
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Send a password recovery request.
 *
 * @async
 * @function recoverPassword
 * @param {Object} params - Recovery data.
 * @param {string} params.email - The email of the user to recover.
 * @returns {Promise<Object>} Response from the API.
 * @throws {Error} If the API responds with an error.
 */
export async function recoverPassword({ email }) {
  try {
    const response = await http.post("/api/users/recover", { email });

    showToast("Check your email to continue", "success");
    console.log(response)
    return response;
  } catch (err) {
    if (err.status >= 500) {
      // Error genérico de servidor
      showToast("Intenta de nuevo más tarde", "error");
    } else {
      // Error específico desde el backend
      showToast(err.message || "Error requesting recovery", "error");
    }

    throw err; // relanzamos por si se maneja más arriba
  }
}


/**
 * Logout a user from the system (client side only).
 *
 * @async
 * @function logoutUser
 * @returns {Promise<void>} Redirects user to home after logout
 */
export async function logoutUser() {
  try {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");

    showToast("Successfully logged out", "success");

    setTimeout(() => {
      window.location.href = "/#/home";
    }, 500);
  } catch (err) {
    showToast("Logout error", "error");
    throw err;
  }
}
