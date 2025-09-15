import { http } from "../api/http.js";
import { getCurrentUser } from "../routes/route.js";

// export const taskService = {
//   getAll: () => http.get("/tasks"),
//   // create: (task) => http.post("/tasks", task),
//   // update: (id, task) => http.put(`/tasks/${id}`, task),
//   // remove: (id) => http.del(`/tasks/${id}`)
// };


export async function createTask({ title, description, date, status, userId }) {
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
