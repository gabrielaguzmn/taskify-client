import { registerUser, loginUser, recoverPassword } from "../services/userService.js";
import { createTask } from "../services/taskService.js";

const app = document.getElementById("app");

/**
 * Build a safe URL for fetching view fragments inside Vite (dev and build).
 * @param {string} name - The name of the view (without extension).
 * @returns {URL} The resolved URL for the view HTML file.
 */
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

/**
 * Load an HTML fragment by view name and initialize its corresponding logic.
 * @async
 * @param {string} name - The view name to load (e.g., "login", "dashboard").
 * @throws {Error} If the view cannot be fetched.
 */
async function loadView(name) {
  const res = await fetch(viewURL(name));
  if (!res.ok) throw new Error(`Failed to load view: ${name}`);
  const html = await res.text();
  app.innerHTML = html;

  if (name === "login") initLogin();
  if (name === "register") initRegister();
  if (name === "recover") initRecover();
  if (name === "dashboard") initDashboard();
}

/**
 * Initialize the hash-based router.
 * Attaches an event listener for URL changes and triggers the first render.
 */
export function initRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute(); // first render
}

/**
 * Handle the current route based on the location hash.
 * Fallback to 'login' if the route is unknown.
 */
function handleRoute() {
  const path = (location.hash.startsWith("#/") ? location.hash.slice(2) : "") || "login";
  const known = ["login", "register", "recover", "dashboard"];
  const route = known.includes(path) ? path : "login";

  loadView(route).catch((err) => {
    console.error(err);
    app.innerHTML = `<p style="color:#ff4d4d">Error loading the view.</p>`;
  });
}

/* ---- View-specific logic ---- */

/**
 * Initialize the "login" view.
 * Handles user login and redirects to dashboard.
 */
function initLogin() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  // const msg = document.getElementById("loginMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // msg.textContent = "";

    try {
      console.log("Attempting login with:", { email: emailInput.value.trim() });
      const response = await loginUser({
        email: emailInput.value.trim(),
        password: passInput.value.trim(),
      });
      console.log("The login has succeeded!!!", response);
      if (response.user) {
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    localStorage.setItem('isLoggedIn', 'true');
  }

      // msg.textContent = "Login successful!";
      setTimeout(() => (location.hash = "#/dashboard"), 400);
    } catch (err) {
      console.error("The login has failed:", err);
      console.error("Error message:", err.message);
      // msg.textContent = `Login failed: ${err.message}`;
    }
  });
}

/**
 * Initialize the "register" view.
 * Handles new user registration.
 */
function initRegister() {
  const form = document.getElementById("registerForm");
 // const msg = document.getElementById("registerMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
  //  msg.textContent = "";

    try {
      const userData = {
        name: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        age: document.getElementById("age").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
      };

      await registerUser(userData);
  //    msg.textContent = "Registration successful!";
  console.log("The register was sucessful !!!!!");
      setTimeout(() => (location.hash = "#/login"), 400);
    } catch (err) {
      console.log("Something has failed:", err.message);
   //   msg.textContent = `Registration failed: ${err.message}`;
    }
  });
}

/**
 * Initialize the "recover" view.
 * Handles password recovery.
 */
function initRecover() {
  const form = document.getElementById("recoverForm");
  const msg = document.getElementById("recoverMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    try {
      await recoverPassword({
        email: document.getElementById("recoverEmail").value.trim(),
      });
      msg.textContent = "Recovery email sent!";
    } catch (err) {
      msg.textContent = `Recovery failed: ${err.message}`;
    }
  });
}

/**
 * Initialize the "dashboard" view.
 * Handles CRUD operations for tasks.
 */
function initDashboard() {
  const form = document.getElementById("taskForm");
  const list = document.getElementById("taskList");

  if (!form || !list) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
    const TaskData = {
      title : document.getElementById("title").value.trim(),
      description : document.getElementById("detail").value.trim(),
      date : document.getElementById("date").value,
      time : document.getElementById("time").value,
      status : document.getElementById("status").value,

      };
    await createTask(TaskData)
    console.log("Succesfully created task")
    } catch(err){
      console.log("Something went wrong :(", err.message)
    }

    // if (!title) return;

    // const taskItem = document.createElement("div");
    // taskItem.className = "task";
    // taskItem.innerHTML = `
    //   <h3>${title}</h3>
    //   <p>${detail}</p>
    //   <small>${date} ${time}</small>
    //   <span>Status: ${status}</span>
    //   <button class="removeBtn">Delete</button>
    // `;

    // list.prepend(taskItem);
    form.reset();

    // Delete task
    // taskItem.querySelector(".removeBtn").addEventListener("click", () => {
    //   taskItem.remove();
    // });
  });
}

/**
 * Get the currently logged-in user
 * @returns {Object|null} User object or null if not logged in
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
export function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  location.hash = '#/login';
}