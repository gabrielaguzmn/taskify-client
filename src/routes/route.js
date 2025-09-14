import { registerUser, loginUser, recoverPassword } from "../services/userService.js";
import { createTask } from "../services/taskService.js";
import logo from "../assets/img/logoPI.jpg";

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

  if (name === "login") {
    const imgEl = document.getElementById("registerLogo");
    if (imgEl) imgEl.src = logo;
  }


  if (name === "register") {
    const imgEl = document.getElementById("registerLogo");
    if (imgEl) imgEl.src = logo;
  }

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
  const msg = document.getElementById("loginMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Processing login...";
    msg.className = "feedback loading";

    try {
      const response = await loginUser({
        email: emailInput.value.trim(),
        password: passInput.value.trim(),
      });

      if (response.user) {
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        localStorage.setItem("isLoggedIn", "true");
      }

      msg.textContent = "Login successful!";
      msg.className = "feedback success";

      setTimeout(() => (location.hash = "#/dashboard"), 800);
    } catch (err) {
      msg.textContent = `Login failed: ${err.message}`;
      msg.className = "feedback error";
    }
  });
}


/**
 * Initialize the "register" view.
 * Handles new user registration.
 */
function initRegister() {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "feedback";

    // Extraer valores
    const userData = {
      name: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      age: parseInt(document.getElementById("age").value.trim(), 10), // <- ya no se valida
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value.trim(),
    };

    //Validaciones personalizadas
    if (!userData.name || !userData.lastName) {
      msg.textContent = "First name and last name are required.";
      msg.classList.add("error");
      return;
    }

    if (!userData.email.includes("@")) {
      msg.textContent = "Please enter a valid email address.";
      msg.classList.add("error");
      return;
    }

    if (userData.password.length < 6) {
      msg.textContent = "Password must be at least 6 characters long.";
      msg.classList.add("error");
      return;
    }

    try {
      await registerUser(userData);
      msg.textContent = "Registration successful!";
      msg.classList.add("success");

      setTimeout(() => (location.hash = "#/login"), 800);
    } catch (err) {
      msg.textContent = `Registration failed: ${err.message}`;
      msg.classList.add("error");
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
  const open = document.getElementById('openModal');
  const close = document.getElementById('closeModal');
  const modal = document.getElementById('taskModal');

  if (!form || !modal || !open || !close) return;

  
  const toggle = (show) => {
    modal.classList.toggle("open", show);
    modal.setAttribute("aria-hidden", show ? "false" : "true");
    if (show) document.getElementById("title").focus();
  };

  open.addEventListener("click", () => toggle(true));
  close.addEventListener("click", () => toggle(false));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) toggle(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      
      const day = document.getElementById("day").value.padStart(2, "0");
      const month = document.getElementById("month").value.padStart(2, "0");
      const year = document.getElementById("year").value;

      const hour = document.getElementById("hour").value.padStart(2, "0");
      const minute = document.getElementById("minute").value.padStart(2, "0");

      
      const date = `${year}-${month}-${day}`;   
      const time = `${hour}:${minute}`;         

      
      const TaskData = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        date,
        time,
        status: document.getElementById("status").value,
      };

      await createTask(TaskData);
      console.log("Task created successfully:", TaskData);

    } catch (err) {
      console.log("Something went wrong:", err.message);
    }

    form.reset();
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