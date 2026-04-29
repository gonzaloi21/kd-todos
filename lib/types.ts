export type Category = "Consumibles" | "Neumáticos" | "Unilink" | string;
export type Priority = "alta" | "media" | "baja";
export type TaskStatus = "pendiente" | "progreso" | "bloqueado" | "completado";
export type InstanceType = "reunion" | "entrega" | "deadline" | "otro";

export interface Task {
  id: number;
  text: string;
  category: Category;
  priority: Priority;
  status: TaskStatus;
  instanceId: number | null;
  createdAt: number;
  updatedAt: number;
  updatedBy: string;
}

export interface Instance {
  id: number;
  name: string;
  type: InstanceType;
  date: string | null;
  createdAt: number;
}
