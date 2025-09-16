import { http } from "../api/http.js";
import { getCurrentUser } from "../routes/route.js";

// export const taskService = {
//   getAll: () => http.get("/tasks"),
//   // create: (task) => http.post("/tasks", task),
//   // update: (id, task) => http.put(`/tasks/${id}`, task),
//   // remove: (id) => http.del(`/tasks/${id}`)
// };

<<<<<<< HEAD

export async function createTask({ title, description, date, status, userId }) {
=======
export const taskService = {
  getAll: async () => {
    const res = await http.get("/tasks");
    return res;
  },
  create: async (task) => {
    const res = await http.post("/tasks", task);
    return res;
  },
  update: async (id, task) => {
    const res = await http.put(`/tasks/${id}`, task);
    return res;
  },
  remove: async (id) => {
    const res = await http.del(`/tasks/${id}`);
    return res;
  }
};

//Función simple para obtener todas las tareas
export async function getTasks() {
  return http.get("/tasks");
}

export async function createTask({ title, description, date, status, userId}) {
>>>>>>> origin
  // Get current user ID automatically
  // const currentUser = getCurrentUser();
  // if (!currentUser) {
  //   throw new Error('User not logged in');
  // }
  try {
    const response = await http.post("/api/tasks/addTask", { 
      title, 
      description, 
      date, 
      status, 
      userId 
    });

<<<<<<< HEAD
    showToast("Task created successfully", "success");

    return response;
  } catch (err) {
    if (err.status >= 500) {
      // Error de servidor (genérico)
      showToast("No pudimos crear la tarea, inténtalo más tarde", "error");
    } else {
      // Errores específicos (400, 401, etc.)
      showToast(err.message || "Error creating task", "error");
    }

    throw err; // lo relanzamos por si se quiere manejar en otro lado
  }
}
=======
  return http.post("/api/tasks/addTask", { 
    title, 
    description, 
    date, 
    status, 
    userId});
}

// 🔹 Función para traer solo las tareas del usuario actual
export async function getTasksByUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("User not logged in");
  }

  return http.get(`/tasks/user/${currentUser.id}`);
}
>>>>>>> origin
