import { registerUser, loginUser, recoverPassword } from "../services/userService.js";
import { createTask } from "../services/taskService.js";

import logo from "../assets/img/logoPI.jpg";

import '../styles/login.css';
import '../styles/dashboard.css';


import logoPI from '../assets/img/logoPI.jpg';


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

  // let html = await res.text();
  // html = html.replace('/src/assets/img/logoPI.jpg', logoPI);

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
  const path = (location.hash.startsWith("#/") ? location.hash.slice(2) : "") || "home";
  const known = ["home", "login", "register", "recover", "dashboard", "changePassword"];
  const route = known.includes(path) ? path : "home";

  loadView(route).catch((err) => {
    console.error(err);
    app.innerHTML = `<p style="color:#ff4d4d">Error loading the view.</p>`;
  });
}
function showSpinner() {
  const spinner = document.createElement("div");
  spinner.id = "global-spinner";
  spinner.innerHTML = `
    <div style="
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      background: rgba(0,0,0,0.3); 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      z-index: 9999;
    ">
      <div style="
        width: 50px; 
        height: 50px; 
        border: 5px solid #ccc; 
        border-top: 5px solid #3498db; 
        border-radius: 50%; 
        animation: spin 1s linear infinite;
      "></div>
    </div>
  `;
  document.body.appendChild(spinner);
}

function hideSpinner() {
  const spinner = document.getElementById("global-spinner");
  if (spinner) spinner.remove();
}

// Keyframes CSS
const style = document.createElement("style");
style.innerHTML = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;
document.head.appendChild(style);

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

  [emailInput, passInput].forEach(input => {
    input.addEventListener("input", () => {
      msg.textContent = "";
      msg.className = "feedback"; // resetea estilos
    });
  });

  //Función de validación dinámica
  const validateForm = () => {
    const emailOk = emailInput.value.trim().length > 0; // && emailInput.value.includes("@")

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
    msg.textContent = "Iniciando sesion...";
    msg.className = "feedback loading";
    btn.disabled = true; 

    if (!validateForm()) {
      msg.textContent = "Ingresa credenciales validas para iniciar sesion";
      msg.className = "feedback error";
      btn.disabled = false;
      return;
    }

    try {
      showSpinner();
      const response = await loginUser({
        email: emailInput.value.trim(),
        password: passInput.value.trim(),
      });
      console.log("The login has succeeded!!!", response);
      if (response.user) {
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        localStorage.setItem("isLoggedIn", "true");
      }

      msg.textContent = "Inicio de sesión exitoso!";
      msg.className = "feedback success";

      setTimeout(() => (location.hash = "#/dashboard"), 800);
    } catch (err) {
      msg.textContent = `Inicio de sesion fallido: ${err.message}`;
      msg.className = "feedback error";
      btn.disabled = false;
    } finally {
    hideSpinner();
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

  const inputs = form.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      msg.textContent = "";
      msg.className = "feedback"; // reset estilos
    });
  });
  
  const nameInput = document.getElementById("name");
  const lastNameInput = document.getElementById("lastName");
  const ageInput = document.getElementById("age");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm");

  const validateForm = () => {
    // Check if any field is empty
    const nameNotEmpty = nameInput.value.trim().length > 0;
    const lastNameNotEmpty = lastNameInput.value.trim().length > 0;
    const ageNotEmpty = ageInput.value.trim().length > 0;
    const emailNotEmpty = emailInput.value.trim().length > 0;
    const passwordNotEmpty = passwordInput.value.trim().length > 0;
    const confirmNotEmpty = confirmInput.value.trim().length > 0;

    const allFieldsFilled = nameNotEmpty && lastNameNotEmpty && ageNotEmpty && 
                           emailNotEmpty && passwordNotEmpty && confirmNotEmpty;
    
    btn.disabled = !allFieldsFilled;

    return allFieldsFilled;
  };

  [nameInput, lastNameInput, ageInput, emailInput, passwordInput, confirmInput].forEach(input => {
    if (input) {
      input.addEventListener("input", validateForm);
      input.addEventListener("blur", validateForm);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "feedback";

    if (!validateForm()) {
      msg.textContent = "Completa todos los campos para registrarte";
      msg.className = "feedback error";
      return;
    }

    try {
      showSpinner();
      const userData = {
        name: nameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        age: parseInt(ageInput.value.trim(), 10),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      };

      const confirmPassword = confirmInput.value.trim();
      
      if (userData.password !== confirmPassword) {
        msg.textContent = "Las contraseñas ingresadas no coinciden";
        msg.className = "feedback error";
        return;
      }

      const validation = validateRegisterForm(userData);
      if (!validation.isValid) {
        msg.textContent = validation.error;
        msg.className = "feedback error";
        return;
      }

      btn.disabled = true; // Disable during submission
      msg.textContent = "Creando una cuenta...";
      msg.className = "feedback loading";

      await registerUser(userData);
      msg.textContent = "Registro exitoso!";
      msg.className = "feedback success";

      form.reset();
      setTimeout(() => (location.hash = "#/login"), 800);

    } catch (err) {
      console.error("Error registrandote:", err);

      let errorMessage = err;

      msg.textContent = errorMessage;
      msg.className = "feedback error";
      
      validateForm();
    } finally {
      hideSpinner();
    }
  });

  validateForm();
}

/**
 * Initialize the "recover" view.
 * Handles password recovery.
 */
function initRecover() {
  const form = document.getElementById("recoverForm");
  const msg = document.getElementById("recoverMsg");

  if (!form) return;

emailInput.addEventListener("input", () => {
    msg.textContent = "";
    msg.className = "feedback"; // resetea estilos
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Solicitando recuperacion de contraseña...";

    try {
      showSpinner();
      await recoverPassword({
        email: document.getElementById("email").value.trim(),
      });
      msg.textContent = "Correo de recuperacion enviado exitosamente!";
    } catch (err) {
      msg.textContent = `No se ha podido enviar el correo de recuperacion: ${err.message}`;
    } finally {
      hideSpinner();
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
  const open = document.getElementById("openModal");
  const close = document.getElementById("closeModal");
  const modal = document.getElementById("taskModal");


  if (open && close && modal) {
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
  }

  if (!form) return;

 const inputs = form.querySelectorAll("input, select");
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      msg.textContent = "";
      msg.className = "feedback";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

try {
  showSpinner();
  // User validation from HEAD (important for security)
  const currentUser = getCurrentUser();
  console.log("Current user from localStorage:", currentUser); // Debug log

  // Better validation
  if (!currentUser) {
    console.error("No user found in localStorage");
    alert("Please log in again");
    location.hash = "#/login";
    return;
  }

  if (!currentUser.id) {
    console.error("User object missing _id:", currentUser);
    alert("Invalid user session. Please log in again");
    location.hash = "#/login";
    return;
  }

  // Date/time collection from KevinPrado/Features (matches your HTML)
  const day = document.getElementById("day").value.padStart(2, "0");
  const month = document.getElementById("month").value.padStart(2, "0");
  const year = document.getElementById("year").value;

  const hour = document.getElementById("hour").value.padStart(2, "0");
  const minute = document.getElementById("minute").value.padStart(2, "0");

  // Validate required fields
  if (!day || !month || !year) {
    alert("Please fill in all date fields (day, month, year)");
    return;
  }

  // Build date and time strings
  const dateString = `${year}-${month}-${day}`;
  const timeString = `${hour}:${minute}`;

  // Create combined Date object for better backend compatibility
  let combinedDate;
  if (hour && minute) {
    // If time is provided, combine date and time
    combinedDate = new Date(`${dateString}T${timeString}:00`);
  } else {
    // If no time provided, use start of day
    combinedDate = new Date(`${dateString}T00:00:00`);
  }

  // Task data object (combining both approaches)
  const TaskData = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    date: combinedDate, // Single Date object for backend
    dateString, // Keep string version if needed
    timeString, // Keep string version if needed
    status: document.getElementById("status").value,
    userId: currentUser.id // Important: include user ID
  };

  console.log("Task data to be sent:", TaskData); // Debug log
  await createTask(TaskData);
  console.log("Task created successfully:", TaskData);

  // Clear form and close modal after success
  form.reset();
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

} catch (err) {
  console.error("Something went wrong:", err.message);
  alert(`Error creating task: ${err.message}`);
} finally {
  hideSpinner();
}
  });
}


/**
 * Get the currently logged-in user
 * @returns {Object|null} User object or null if not logged in
 */
export function getCurrentUser() {
  try {
    console.log("Getting current user from localStorage..."); // Debug log
    const userStr = localStorage.getItem('currentUser');
    console.log("Raw user string:", userStr); // Debug log

    if (!userStr) {
      console.log("No user string found in localStorage");
      return null;
    }

    const user = JSON.parse(userStr);
    console.log("Parsed user object:", user); // Debug log

    // Validate user object structure
    if (!user || typeof user !== 'object') {
      console.error("Invalid user object structure");
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isLoggedIn');
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error parsing user data:', error);
    // Clear corrupted data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
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

function validateRegisterForm(userData) {
  let text = "";
  if (parseInt(userData.age) < 13) {
    text = "No tienes edad suficiente para registrarte :(";
    return { isValid: false, error: text };
  }
  else if (userData.password.length < 8 || !/[A-Z]/.test(userData.password)
    || !/[0-9]/.test(userData.password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(userData.password)) {
    text = "La contraseña debe de contener al menos 8 caracteres e incluir una mayuscula, un caracter especial y un numero";
    return { isValid: false, error: text };
  }
  else {
    return { isValid: true, error: null };
  }
}
