import { registerUser, loginUser, recoverPassword, getCurrentUser } from "../services/userService.js";
import { getTasks, createTask } from "../services/taskService.js";
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

  if (name === "home") initHome();
  if (name === "login") initLogin();
  if (name === "register") initRegister();
  if (name === "changePassword") initChangePassword();
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
  const known = ["home", "login", "register", "recover", "dashboard", "changePassword"];
  const route = known.includes(path) ? path : "login";

  loadView(route).catch((err) => {
    console.error(err);
    app.innerHTML = `<p style="color:#ff4d4d">Error loading the view.</p>`;
  });
}

/* ---- View-specific logic ---- */

function initHome() {
  const buttons = document.querySelectorAll("[data-route]");

  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const route = btn.getAttribute("data-route");
      location.hash = `#/${route}`;
    });
  });
}

/**
 * Initialize the "login" view.
 * Handles user login and redirects to dashboard.
 */
function initLogin() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const msg = document.getElementById("loginMsg");
  const btn = document.getElementById("loginBtn"); 

  if (!form) return;

  //Función de validación dinámica
  const validateForm = () => {
    const emailOk = emailInput.value.trim().length > 0 && emailInput.value.includes("@");
    const passOk = passInput.value.trim().length > 0;

    const valid = emailOk && passOk;
    btn.disabled = !valid; // desactiva si algo no está válido
    return valid;
  };

  // Validar en cada cambio
  emailInput.addEventListener("input", validateForm);
  passInput.addEventListener("input", validateForm);

  //Envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Processing login...";
    msg.className = "feedback loading";
    btn.disabled = true; 

    if (!validateForm()) {
      msg.textContent = "Please enter a valid email and password.";
      msg.className = "feedback error";
      btn.disabled = false;
      return;
    }

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
      btn.disabled = false;
    }
  });

  // inicializar validación al cargar
  validateForm();
}



/**
 * Initialize the "register" view.
 * Handles new user registration.
 */
function initRegister() {
  const form = document.getElementById("registerForm");
  const msg = document.getElementById("registerMsg");
  const btn = document.getElementById("registerBtn");

  if (!form) return;

  const inputs = {
    name: document.getElementById("name"),
    lastName: document.getElementById("lastName"),
    age: document.getElementById("age"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
  };

  //función de validación
  const validateForm = () => {
    const nameOk = inputs.name.value.trim().length > 0;
    const lastNameOk = inputs.lastName.value.trim().length > 0;
    const ageOk = inputs.age.value.trim() !== "" && !isNaN(inputs.age.value);
    const emailOk = inputs.email.value.includes("@");
    const passOk = inputs.password.value.trim().length >= 6;
    const confirmOk = inputs.password.value === inputs.confirmPassword.value;

    const valid = nameOk && lastNameOk && ageOk && emailOk && passOk && confirmOk;
    btn.disabled = !valid;

    
    if (!confirmOk && inputs.confirmPassword.value.length > 0) {
      msg.textContent = "Passwords do not match.";
      msg.className = "feedback error";
    } else {
      msg.textContent = "";
      msg.className = "feedback";
    }

    return valid;
  };

  // validar en cada input
  Object.values(inputs).forEach(input => {
    input.addEventListener("input", validateForm);
  });

  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "feedback";
    btn.disabled = true; 

    const userData = {
      name: inputs.name.value.trim(),
      lastName: inputs.lastName.value.trim(),
      age: parseInt(inputs.age.value.trim(), 10),
      email: inputs.email.value.trim(),
      password: inputs.password.value.trim(),
    };

    // Validaciones personalizadas (mensajes en el label)
    if (!userData.name || !userData.lastName) {
      msg.textContent = "First name and last name are required.";
      msg.classList.add("error");
      btn.disabled = false;
      return;
    }

    if (!userData.email.includes("@")) {
      msg.textContent = "Please enter a valid email address.";
      msg.classList.add("error");
      btn.disabled = false;
      return;
    }

    if (userData.password.length < 6) {
      msg.textContent = "Password must be at least 6 characters long.";
      msg.classList.add("error");
      btn.disabled = false;
      return;
    }

    if (userData.password !== inputs.confirmPassword.value.trim()) {
      msg.textContent = "Passwords do not match.";
      msg.classList.add("error");
      btn.disabled = false;
      return;
    }

    try {
      await registerUser(userData);
      msg.textContent = "Registration successful!";
      msg.classList.add("success");

      form.reset();
      btn.disabled = true;
      setTimeout(() => (location.hash = "#/login"), 800);
    } catch (err) {
      msg.textContent = `Registration failed: ${err.message}`;
      msg.classList.add("error");
      btn.disabled = false;
    }
  });

  // inicializar validación al cargar
  validateForm();
}

function initChangePassword() {
  const form = document.getElementById("changePasswordForm");
  const msg = document.getElementById("changePasswordMsg");
  const backBtn = document.getElementById("backBtn");

  if (!form) return;

  // volver atrás
  backBtn.addEventListener("click", () => {
    location.hash = "#/dashboard"; 
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Processing...";
    msg.className = "feedback loading";

    const oldPassword = document.getElementById("oldPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Validaciones básicas
    if (newPassword !== confirmPassword) {
      msg.textContent = "New passwords do not match.";
      msg.className = "feedback error";
      return;
    }

    try {
      
      const res = await fetch("http://localhost:3000/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) throw new Error("Error changing password");
      msg.textContent = "Password changed successfully!";
      msg.className = "feedback success";

      form.reset();
      setTimeout(() => (location.hash = "#/login"), 1200);
    } catch (err) {
      msg.textContent = `Error: ${err.message}`;
      msg.className = "feedback error";
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
  const open = document.getElementById("openModal");
  const close = document.getElementById("closeModal");
  const modal = document.getElementById("taskModal");

  if (!form || !modal || !open || !close) return;

  // --- Toggle modal ---
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

  // --- Función para renderizar tarea ---
  const renderTask = (task) => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.innerHTML = `
      <h3>${task.title || "Untitled Task"}</h3>
      <p>${task.description || "No description"}</p>
      <div class="meta">
        <span>📅 ${task.date}</span>
        <span>⏰ ${task.time}</span>
      </div>
      <div class="actions">
        <button class="edit">✏️</button>
        <button class="delete">🗑️</button>
      </div>
    `;

    if (task.status === "to do") {
      document.getElementById("todoList").appendChild(taskCard);
    } else if (task.status === "doing") {
      document.getElementById("doingList").appendChild(taskCard);
    } else if (task.status === "done") {
      document.getElementById("doneList").appendChild(taskCard);
    }
  };

  // --- Cargar tareas al iniciar ---
  (async () => {
    try {
      const tasks = await getTasks(); // Llama al backend
      tasks.forEach(renderTask);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  })();

  // --- Envío del formulario ---
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

      const savedTask = await createTask(TaskData); // Guardar en el back
      renderTask(savedTask); // Mostrar en el front

      console.log("Task created successfully:", savedTask);

      form.reset();
      toggle(false);
    } catch (err) {
      console.error("Something went wrong:", err.message);
    }
  });
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