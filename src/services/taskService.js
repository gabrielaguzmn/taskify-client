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

  return http.post("/api/tasks/addTask", { 
    title, 
    description, 
    date, 
    status, 
    userId});
}