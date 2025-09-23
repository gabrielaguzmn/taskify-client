import { registerUser, loginUser, recoverPassword, resetPassword, getMyInformation, updateUser, logoutUser } from "../services/userService.js";
import { getTasksByUser, createTask, editTask, deleteTasks } from "../services/taskService.js";
import { showToast } from "../services/toastService.js";
import { isAuthenticated } from "../services/userService.js";

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
  const fullHash = location.hash.startsWith("#/") ? location.hash.slice(2) : "";
    const [path, queryString] = fullHash.split('?');
    const routePath = path || "home";
  
  const known = ["home", "login", "register", "recover", "dashboard", "changePassword", "about", "profile", "profileEdit"];
  const route = known.includes(routePath) ? routePath : "home";
  
  const protectedRoutes = ["dashboard", "profile", "profileEdit"];

  if (route === "login" || route === "register" || route === "home") {
    isAuthenticated().then((loggedIn) => {
      if (loggedIn) {
        location.hash = "#/dashboard";
        return;
      }
      continueToLoadView();
    }).catch(() => {
      continueToLoadView();
    });
    return;
  }

  if (protectedRoutes.includes(route)) {
    showSpinner();
    isAuthenticated().then((loggedIn) => {
      hideSpinner();
      if (!loggedIn) {
        showToast("Inicia sesión para acceder a esta función", "error");
        setTimeout(() => {
          location.hash = "#/login";
        }, 1000);
        return;
      }
      continueToLoadView();
    }).catch((error) => {
      hideSpinner();
      showToast("Error de autenticacion. Inicia sesión de nuevo", "error");
      setTimeout(() => {
        location.hash = "#/login";
      }, 1000);
    });
    return;
  }
  continueToLoadView();

  function continueToLoadView() {
    window.currentQueryParams = queryString ? new URLSearchParams(queryString) : new URLSearchParams();
    loadView(route).catch((err) => {
      console.error("Error loading view:", err);
      app.innerHTML = `<p style="color:#ff4d4d">Error loading the view: ${route}</p>`;
    });
  }
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
    showMessage('Token invalido. Por favor solicita un nuevo cambio de contraseña', 'error');
    if (acceptBtn) acceptBtn.disabled = true;
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
        showMessage('Las contraseñas ingresadas no coinciden', 'error');
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
        showMessage('Las contraseñas deben de tener 8 caracteres minimo y deben de coincidir', 'error');
        return;
      }

      const newPassword = newPasswordInput.value;
      
      acceptBtn.disabled = true;
      acceptBtn.textContent = 'Cambiando contraseña...';
      showMessage('Cambiando contraseña....', 'loading');

      try {
        showSpinner();
        
        const result = await resetPassword(token, newPassword);
        showMessage('Contraseña actualizada correctamente! Redirigiendo a login...', 'success');
        
        setTimeout(() => {
          location.hash = '#/login';
        }, 5000);

      } catch (error) {
        showMessage(error.message, 'error');
        acceptBtn.disabled = false;
        acceptBtn.textContent = 'Aceptar';
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
  const deleteModal = document.getElementById("confirmModal");
  const deleteModalNo = document.getElementById("deleteModalNo");
  const deleteModalSi = document.getElementById("deleteModalSi");
  const msg = document.getElementById("taskMsg"); 
  let taskId = null;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      showSpinner();
      logoutUser()
      hideSpinner();});
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
  
  const toggleDelete = (show) => {
        deleteModal.classList.toggle("open", show);
        deleteModal.setAttribute("aria-hidden", show ? "false" : "true");
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
      if (msg) { 
        msg.textContent = "";
        msg.className = "feedback";
      }
    });
  });

  const renderTask = (task) => {
    const isoDate = task.date
    const date = isoDate.substring(0,10)
    const hour = isoDate.substring(11,19)
    // Extraer fecha y hora de tarea
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.setAttribute("data-id", task._id);
    taskCard.innerHTML = `
      <h3>${task.title || "Untitled Task"}</h3>
      <p>${task.description || "No description"}</p>
      <div class="meta">
        <span>📅 ${date}</span>
        <span>⏰ ${hour}</span>
      </div>
      <div class="actions">
        <button class="edit">✏️</button>
        <button class="delete">🗑️</button>
      </div>
    `;

    const editButton = taskCard.querySelector(".edit");
    const deleteButton = taskCard.querySelector(".delete");
    


  
    if (editButton) {
      console.log("click edit view")
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


  const closeDelete = document.getElementById("closeModalDelete");
  
  

      if (deleteButton) {
          // console.log("click Delete");
          deleteButton.addEventListener("click", () => {
          taskId = task._id; 
          console.log("Taskid: ", taskId)
          toggleDelete(true); // abre modal de eliminar
        } );
     }

  closeDelete.addEventListener("click", () => toggleDelete(false));
  deleteModalNo.addEventListener("click", () => toggleDelete(false));
  



  document.addEventListener("keydown", (e) => {
    
    if (e.key === "Escape") toggleDelete(false);
  });

    if (task.status === "to do") {
      document.getElementById("todoList").appendChild(taskCard);
    } else if (task.status === "doing") {
      document.getElementById("doingList").appendChild(taskCard);
    } else if (task.status === "done") {
      document.getElementById("doneList").appendChild(taskCard);
    }
  };

  (async () => {
    try {
          const userInfo = await getMyInformation();
      const userId = userInfo._id;
      const tasks = await getTasksByUser(userId);
      tasks.forEach(renderTask);
    } catch (err) {
      console.error("Error cargando tareas:", err);
    }
  })();

  deleteModalSi.addEventListener("click", () => {
    console.log("Taskid: ", taskId);
    deleteTasks(taskId);
    toggleDelete(false);
    document.querySelector(`.task-card[data-id="${taskId}"]`)?.remove();
    //renderTask(savedTask);
  });


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      showSpinner();

          const userInfo = await getMyInformation();
      const currentUserId = userInfo._id;

      const day = document.getElementById("day").value.padStart(2, "0");
      const month = document.getElementById("month").value.padStart(2, "0");
      const year = document.getElementById("year").value;

      const hour = document.getElementById("hour").value.padStart(2, "0");
      const minute = document.getElementById("minute").value.padStart(2, "0");

      if (!day || !month || !year) {
        showToast("Por favor llena todos los campos", "error");
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
        status: document.getElementById("status").value,
        userId: currentUserId
      };

      const TaskDataEdit = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        date: combinedDate,
        dateString,
        timeString,
        status: document.getElementById("status").value,
        userId: currentUserId,
        idTask: taskId
      };

      let savedTask;
          if (taskId) {
            // --- Update existing task ---
            savedTask = await editTask(TaskDataEdit);
            console.log("Task id: ", taskId)
            document.querySelector(`.task-card[data-id="${taskId}"]`)?.remove();
            taskId = null; // Reset after editing
        // Opcional: eliminar tarjeta vieja y renderizar nueva
          
          } else {
        // --- Create new task ---
            console.log("Creating new task with data:", taskId);
            savedTask = await createTask(TaskData);
        }
      
      renderTask(savedTask);
      form.reset();
      toggle(false);

    } catch (err) {
            console.error("The following error has happened:",err)

    } finally {
      hideSpinner();
    }
  });
}



function initProfile() {
  // --- Cargar información del usuario ---
  (async () => {
    try {
      const userInfo = await getMyInformation();
      document.getElementById("profileName").textContent = userInfo.name || "";
      document.getElementById("profileLastName").textContent = userInfo.lastName || "";
      document.getElementById("profileEmail").textContent = userInfo.email || "";
      document.getElementById("profileAge").textContent = userInfo.age || "";
    } catch (error) {
      showToast("Error recuperando tu informacion personal", "error");
    }
  })();

  // --- Botón Editar perfil ---
  const editBtn = document.getElementById("editProfileBtn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      location.hash = "#/profileEdit";
    });
  }

  // --- Botón Eliminar perfil ---
  const deleteBtn = document.getElementById("deleteProfileBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const confirmDelete = confirm(
        "¿Seguro que quieres eliminar tu perfil? Esta acción no se puede deshacer."
      );
      if (!confirmDelete) return;

      try {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
          showToast("No se encontró el usuario. Inicia sesión nuevamente.", "error");
          location.hash = "#/login";
          return;
        }

        const response = await fetch(`/api/users/${currentUser.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          showToast("Perfil eliminado correctamente.", "success");
          localStorage.removeItem("currentUser");
          location.hash = "#/register"; // o "#/home" según tu flujo
        } else {
          const errorData = await response.json();
          showToast("Error: " + errorData.message, "error");
        }
      } catch (err) {
        console.error("Error eliminando perfil:", err);
        showToast("Ocurrió un problema al eliminar el perfil.", "error");
      }
    });
  }
}

/* ---- NUEVO: Vista de edición de perfil ---- */
function initProfileEdit() {
 
  const form = document.getElementById("editProfileForm");
  const msg = document.getElementById("editMsg");

    (async() => {
    try {

  const userInfo = await getMyInformation()

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
      showToast("Error recuperando tu informacion personal", "error");

    }
  })()
    

  form.addEventListener("submit", async (e) => {
    e.preventDefault();


    msg.textContent = "Actualizando...";
    msg.className = "feedback";

    try {

        const userInfo = await getMyInformation()

              const currentUserId = userInfo._id;      

      const updatedData = {
        name: document.getElementById("editName").value.trim(),        
        lastName: document.getElementById("editLastName").value.trim(), 
        email: document.getElementById("editEmail").value.trim(),          
        age: document.getElementById("editAge").value.trim()            
      };

      const result = await updateUser(currentUserId, updatedData);
      
      // if (result.user) {
      //   localStorage.setItem("currentUser", JSON.stringify(result.user));
      // }

      msg.textContent = "Perfil actualizado!";
      msg.className = "feedback success";

      showToast("Perfil actualizado exitosamente!", "success");
      setTimeout(() => (location.hash = "#/profile"), 800);
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "feedback error";
      showToast("Error actualizando perfil", "error");
    }
  });
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
