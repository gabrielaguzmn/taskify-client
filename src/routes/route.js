import { registerUser, loginUser, recoverPassword, resetPassword, getMyInformation, updateUser } from "../services/userService.js";
import { getTasksByUser, createTask, editTask } from "../services/taskService.js";


import logo from "../assets/img/logoPI.jpg";

import '../styles/login.css';
import '../styles/dashboard.css';
import '../styles/home.css'
import '../styles/changePassword.css'
import '../styles/recover.css'
import '../styles/register.css'



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

   if (name === "home") {
    const imgEl = document.getElementById("registerLogo");
    if (imgEl) imgEl.src = logo;
  }

  if (name === "login") {
    const imgEl = document.getElementById("registerLogo");
    if (imgEl) imgEl.src = logo;
  }

   if (name === "about") {
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
  if (name === "profile") initProfile();
  if (name === "profileEdit") initProfileEdit();
  if (name === "about") initAbout();

  document.body.className = ""; // elimina todas las clases previas
  document.body.classList.add(`${name}-page`); // añade la clase específica de la vista 
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
  // Get the full hash including query parameters
  const fullHash = location.hash.startsWith("#/") ? location.hash.slice(2) : "";
  
  // Split path from query parameters
  const [path, queryString] = fullHash.split('?');
  
  // Default to 'home' if no path
  const routePath = path || "home";
  
  const known = ["home", "login", "register", "recover", "dashboard", "changePassword", "about", "profile", "profileEdit"];
  const route = known.includes(routePath) ? routePath : "home";

  // Store query parameters globally so views can access them
  window.currentQueryParams = queryString ? new URLSearchParams(queryString) : new URLSearchParams();

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

function initChangePassword() {
let token = null;

    if (window.currentQueryParams) {
    token = window.currentQueryParams.get('token');
  }
  
  // Method 2: Fallback - try to get from URL search params directly
  if (!token) {
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token');
  }
  
  // Method 3: Fallback - try to get from hash part after '?'
  if (!token) {
    const hashPart = window.location.hash;
    if (hashPart.includes('?')) {
      const queryPart = hashPart.split('?')[1];
      const params = new URLSearchParams(queryPart);
      token = params.get('token');
    }
  }
  
  const form = document.getElementById("changePasswordForm");
  const msg = document.getElementById("changePasswordMsg");
  const acceptBtn = document.getElementById("acceptBtn");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const tokenInput = document.getElementById("resetToken");

  if (!form) return;

  // Show message helper function
  function showMessage(text, type = 'info') {
    if (msg) {
      msg.textContent = text;
      msg.className = `feedback ${type}`;
    }
  }

  // Store token in hidden field
  if (tokenInput && token) {
    tokenInput.value = token;
  }

  // Check if token exists
  if (!token) {
    showMessage('Invalid or missing reset token. Please request a new password reset.', 'error');
    if (acceptBtn) acceptBtn.disabled = true;
    console.error('Invalid token:', token);
    return;
  }

  // Clear messages on input
  [newPasswordInput, confirmPasswordInput].forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        showMessage('', '');
      });
    }
  });

  // Form validation function
  function validateForm() {
    if (!newPasswordInput || !confirmPasswordInput || !acceptBtn) return false;
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (newPassword.length >= 8 && newPassword === confirmPassword) {
      acceptBtn.disabled = false;
      showMessage('', '');
      return true;
    } else {
      acceptBtn.disabled = true;
      if (newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
      }
      return false;
    }
  }

  // Add event listeners for real-time validation
  if (newPasswordInput) newPasswordInput.addEventListener('input', validateForm);
  if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validateForm);

  // Handle form submission
  if (acceptBtn) {
    acceptBtn.addEventListener('click', async function(e) {
      e.preventDefault();

      if (!validateForm()) {
        showMessage('Passwords must be at least 8 characters and match', 'error');
        return;
      }

      const newPassword = newPasswordInput.value;
      
      acceptBtn.disabled = true;
      acceptBtn.textContent = 'Resetting...';
      showMessage('Resetting password...', 'loading');

      try {
        showSpinner();
        
        const result = await resetPassword(token, newPassword);
        showMessage('Password reset successfully! Redirecting to login...', 'success');
        
        setTimeout(() => {
          location.hash = '#/login';
        }, 5000);

      } catch (error) {
        console.error('Password reset error:', error);
        showMessage(error.message || 'An error occurred. Please try again.', 'error');
        acceptBtn.disabled = false;
        acceptBtn.textContent = 'Accept';
      } finally {
        hideSpinner();
      }
    });
  }

  // Initial validation
  validateForm();
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
      // console.log("The login has succeeded!!!", response);

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


// inint about us
function initAbout() {
  console.log("About page loaded");
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
  const emailInput = document.getElementById("email");
  if (!form) return;

email.addEventListener("input", () => {
    msg.textContent = "";
    msg.className = "feedback"; // resetea estilos
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Solicitando recuperación...";

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
  const msg = document.getElementById("taskMsg"); 
  let taskId = null;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }

  const profileBtn = document.getElementById("profileBtn");
if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    location.hash = "#/profile"; // 🔹 redirige a la vista perfil
  });
}

  if (!form || !modal || !open || !close) return;

  // --- Toggle modal ---
  const toggle = (show) => {
    modal.classList.toggle("open", show);
    modal.setAttribute("aria-hidden", show ? "false" : "true");
    if (show) document.getElementById("title").focus();
  };

  open.addEventListener("click", () => {taskId = null;
                                        toggle(true);
  } );
  close.addEventListener("click", () => toggle(false));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) toggle(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });

  const inputs = form.querySelectorAll("input, select");
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      if (msg) { // ✅ Add safety check
        msg.textContent = "";
        msg.className = "feedback";
      }
    });
  });

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

    const editButton = taskCard.querySelector(".edit");
    if (editButton) {
      
      editButton.addEventListener("click", () => {
      taskId = task._id; 
      document.getElementById("title").value = task.title || "";
      document.getElementById("description").value = task.description || "";
      if (task.date) {
        const date = new Date(task.date);
        document.getElementById("day").value = String(date.getDate()).padStart(2, "0");
        document.getElementById("month").value = String(date.getMonth() + 1).padStart(2, "0");
        document.getElementById("year").value = date.getFullYear();
        document.getElementById("hour").value = String(date.getHours()).padStart(2, "0");
        document.getElementById("minute").value = String(date.getMinutes()).padStart(2, "0");
      }
      document.getElementById("status").value = task.status || "to do";

      toggle(true);
    });
  }

    if (task.status === "to do") {
      document.getElementById("todoList").appendChild(taskCard);
    } else if (task.status === "doing") {
      document.getElementById("doingList").appendChild(taskCard);
    } else if (task.status === "done") {
      document.getElementById("doneList").appendChild(taskCard);
    }
  };

  // --- Cargar tareas al iniciar ---
async function loadTasks() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Debes iniciar sesión");
      location.hash = "#/login";
      return;
    }

    // limpiar columnas antes de volver a renderizar
    document.getElementById("todoList").innerHTML = "";
    document.getElementById("doingList").innerHTML = "";
    document.getElementById("doneList").innerHTML = "";

    const tasks = await getTasksByUser(currentUser.id);
    tasks.forEach(renderTask);
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      showSpinner();
      
      const currentUser = getCurrentUser();
      console.log("Current user from localStorage:", currentUser);

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

      const day = document.getElementById("day").value.padStart(2, "0");
      const month = document.getElementById("month").value.padStart(2, "0");
      const year = document.getElementById("year").value;

      const hour = document.getElementById("hour").value.padStart(2, "0");
      const minute = document.getElementById("minute").value.padStart(2, "0");

      if (!day || !month || !year) {
        alert("Please fill in all date fields (day, month, year)");
        return;
      }

      const dateString = `${year}-${month}-${day}`;
      const timeString = `${hour}:${minute}`;

      let combinedDate;
      if (hour && minute) {
        combinedDate = new Date(`${dateString}T${timeString}:00`);
      } else {
        combinedDate = new Date(`${dateString}T00:00:00`);
      }

      const TaskData = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        date: combinedDate,
        dateString,
        timeString,
        status: document.getElementById("status").value,
        userId: currentUser.id
      };

      const TaskDataEdit = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        date: combinedDate,
        dateString,
        timeString,
        status: document.getElementById("status").value,
        userId: currentUser.id,
        idTask: taskId
      };

      let savedTask;
          if (taskId) {
            // --- Update existing task ---
            savedTask = await editTask(TaskDataEdit);
            taskId = null; // Reset after editing
        // Opcional: eliminar tarjeta vieja y renderizar nueva
          document.querySelector(`.task-card[data-id="${taskId}"]`)?.remove();
          } else {
        // --- Create new task ---
            console.log("Creating new task with data:", taskId);
            savedTask = await createTask(TaskData);
        }
      
      renderTask(savedTask);
      
      
      console.log("Task created successfully:", savedTask);

      // ✅ Clean form reset and modal close
      form.reset();
      toggle(false);

    } catch (err) {
      console.error("Something went wrong:", err.message);
      alert(`Error creating task: ${err.message}`);
    } finally {
      hideSpinner();
    }
  });
}



function initProfile() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("Debes iniciar sesión");
    location.hash = "#/login";
    return;
  }
  (async() => {
    try {
const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='))?.split('=')[1];      
  const userInfo = await getMyInformation(token)
      document.getElementById("profileName").textContent = userInfo.name || "";
  document.getElementById("profileLastName").textContent = userInfo.lastName || "";
  document.getElementById("profileEmail").textContent = userInfo.email || "";
  document.getElementById("profileAge").textContent = userInfo.age || "";

    }
    catch(error) {
      console.log("An error has happened retrieving your user information", error)

    }
  })()

  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      location.hash = "#/profileEdit";
    });
  }
}

/* ---- NUEVO: Vista de edición de perfil ---- */
function initProfileEdit() {
  const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='))?.split('=')[1];      

  // const token = localStorage.getItem("authToken")
  const currentUser = getCurrentUser();
  console.log(currentUser)
  console.log(token)
  const form = document.getElementById("editProfileForm");
  const msg = document.getElementById("editMsg");

  if (!currentUser) {
    alert("Debes iniciar sesión");

    location.hash = "#/login";
    return;
  }

    (async() => {
    try {
const token = document.cookie.split(';').find(cookie => cookie.trim().startsWith('authToken='))?.split('=')[1];      
  const userInfo = await getMyInformation(token)
    // Prellenar campos
  const editNameInput = document.getElementById("editName");
  const editLastNameInput = document.getElementById("editLastName");
  const editEmailInput = document.getElementById("editEmail");
  const editAgeInput = document.getElementById("editAge");
  editNameInput.value = userInfo.name || "";
  editLastNameInput.value = userInfo.lastName || "";
  editEmailInput.value = userInfo.email || "";
  editAgeInput.value = userInfo.age || "";
  
    }
    catch(error) {
      console.log("An error has happened retrieving your user information", error)

    }
  })()
    

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Actualizando...";
    msg.className = "feedback";

    try {
const updatedData = {
        name: document.getElementById("editName").value.trim(),        
        lastName: document.getElementById("editLastName").value.trim(), 
        email: document.getElementById("editEmail").value.trim(),          
        age: document.getElementById("editAge").value.trim()            
      };

      const result = await updateUser(currentUser.id || currentUser._id, updatedData);
      localStorage.setItem("currentUser", JSON.stringify(result));

      msg.textContent = "Perfil actualizado!";
      msg.classList.add("success");

      setTimeout(() => (location.hash = "#/profile"), 800);
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      msg.textContent = `Error: ${err.message}`;
      msg.classList.add("error");
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
    const userStr = localStorage.getItem("currentUser");
    console.log("Raw user string:", userStr); // Debug log

    if (!userStr) {
      console.log("No user string found in localStorage");
      return null;
    }

    

    const user = JSON.parse(userStr);
    // console.log("Parsed user object:", user); // Debug log

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
