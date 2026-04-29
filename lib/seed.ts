import { ref, set, get } from "firebase/database";
import { db } from "./firebase";
import { Task } from "./types";

const SEED_TASKS: Omit<Task, "id">[] = [
  { text: "Deep dive", category: "Consumibles", priority: "media", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
  { text: "Cruce categorización v2 → por SKU", category: "Consumibles", priority: "media", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
  { text: "Levantar proveedores", category: "Consumibles", priority: "media", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
  { text: "Contactar proveedores y actualizar excel (Unilink): mail a KD y agendar", category: "Neumáticos", priority: "alta", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
  { text: "Editar checklist para que el Anexo A sea el económico", category: "Neumáticos", priority: "alta", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
  { text: "Agregar instrucciones subida archivos en BA (punto 2.8) y ajustar fechas", category: "Neumáticos", priority: "alta", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
  { text: "Subir todo de nuevo cuando estemos listos", category: "Unilink", priority: "media", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
  { text: "Documentos de entregas separados en 3: técnicos, administrativos y económicos", category: "Unilink", priority: "media", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
  { text: "Agregar proveedores cuando estemos listos", category: "Unilink", priority: "media", status: "pendiente", instanceId: null, createdAt: Date.now(), updatedAt: Date.now(), updatedBy: "system" },
];

export async function seedIfEmpty() {
  const tasksRef = ref(db, "state/tasks");
  const snapshot = await get(tasksRef);
  if (snapshot.exists()) return;

  const now = Date.now();
  const tasks: Record<string, Task> = {};
  SEED_TASKS.forEach((t, i) => {
    const id = now + i;
    tasks[id] = { ...t, id, createdAt: now + i, updatedAt: now + i };
  });
  await set(tasksRef, tasks);
}
