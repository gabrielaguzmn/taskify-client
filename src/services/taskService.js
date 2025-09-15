import { http } from "../api/http.js";
import { getCurrentUser } from "../routes/route.js";

// export const taskService = {
//   getAll: () => http.get("/tasks"),
//   // create: (task) => http.post("/tasks", task),
//   // update: (id, task) => http.put(`/tasks/${id}`, task),
//   // remove: (id) => http.del(`/tasks/${id}`)
// };

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
  // Get current user ID automatically
  // const currentUser = getCurrentUser();
  // if (!currentUser) {
  //   throw new Error('User not logged in');
  // }

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