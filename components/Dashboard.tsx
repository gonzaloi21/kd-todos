"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/hooks/useDatabase";
import { Task, TaskStatus, Category } from "@/lib/types";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";
import InstancePanel from "./InstancePanel";

const STATUS_FILTERS: { value: TaskStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "progreso", label: "En progreso" },
  { value: "bloqueado", label: "Bloqueados" },
  { value: "completado", label: "Completados" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const email = user?.email ?? "";
  const { tasks, instances, connected, lastUpdate, addTask, updateTask, deleteTask, addInstance, deleteInstance } = useDatabase(email);

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "todos">("todos");
  const [priorityFilter, setPriorityFilter] = useState(false);
  const [instanceFilter, setInstanceFilter] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "instances">("tasks");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "todos" && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== "alta") return false;
      if (instanceFilter !== null && t.instanceId !== instanceFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, instanceFilter]);

  const grouped = useMemo(() => {
    const map: Record<Category, Task[]> = {};
    for (const t of filtered) {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    }
    return map;
  }, [filtered]);

  const categories = useMemo(() => {
    const all = new Set(tasks.map((t) => t.category));
    return ["Consumibles", "Neumáticos", "Unilink", ...Array.from(all).filter((c) => !["Consumibles", "Neumáticos", "Unilink"].includes(c))];
  }, [tasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pendiente: tasks.filter((t) => t.status === "pendiente").length,
    progreso: tasks.filter((t) => t.status === "progreso").length,
    bloqueado: tasks.filter((t) => t.status === "bloqueado").length,
    completado: tasks.filter((t) => t.status === "completado").length,
  }), [tasks]);

  const taskCounts = useMemo(() => {
    const map: Record<number, number> = {};
    for (const t of tasks) {
      if (t.instanceId) map[t.instanceId] = (map[t.instanceId] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  const completedByCategory = useMemo(() => {
    const map: Record<Category, { done: number; total: number }> = {};
    for (const t of tasks) {
      if (!map[t.category]) map[t.category] = { done: 0, total: 0 };
      map[t.category].total++;
      if (t.status === "completado") map[t.category].done++;
    }
    return map;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900">KD Todos</h1>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${activeTab === "tasks" ? "bg-gray-100 font-medium text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
              >
                Tareas
              </button>
              <button
                onClick={() => setActiveTab("instances")}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${activeTab === "instances" ? "bg-gray-100 font-medium text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
              >
                Instancias {instances.length > 0 && <span className="ml-1 text-xs bg-gray-200 rounded-full px-1.5">{instances.length}</span>}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-orange-400"}`} />
              <span className="text-xs text-gray-500">{connected ? "Conectado" : "Reconectando..."}</span>
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">{email.split("@")[0]}</span>
            <button onClick={() => logout()} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {activeTab === "tasks" ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total", value: stats.total, color: "text-gray-700" },
                { label: "Pendientes", value: stats.pendiente, color: "text-gray-600" },
                { label: "En progreso", value: stats.progreso, color: "text-blue-600" },
                { label: "Bloqueados", value: stats.bloqueado, color: "text-red-600" },
                { label: "Completados", value: stats.completado, color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${statusFilter === f.value ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  onClick={() => setPriorityFilter((v) => !v)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${priorityFilter ? "bg-red-100 text-red-700 border border-red-200" : "bg-white border border-gray-200 text-gray-600 hover:border-red-200"}`}
                >
                  Prioridad alta
                </button>
              </div>

              {instances.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInstanceFilter(null)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${instanceFilter === null ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"}`}
                  >
                    Todas
                  </button>
                  {instances.map((inst) => (
                    <button
                      key={inst.id}
                      onClick={() => setInstanceFilter(inst.id === instanceFilter ? null : inst.id)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${instanceFilter === inst.id ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"}`}
                    >
                      {inst.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Task groups by category */}
            <div className="space-y-6">
              {categories.map((cat) => {
                const catTasks = grouped[cat] ?? [];
                const catStats = completedByCategory[cat];
                if (catTasks.length === 0 && statusFilter !== "todos") return null;
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{cat}</h2>
                      {catStats && (
                        <span className="text-xs text-gray-400">{catStats.done}/{catStats.total}</span>
                      )}
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="space-y-2">
                      {catTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          instances={instances}
                          onUpdate={updateTask}
                          onDelete={deleteTask}
                        />
                      ))}
                      {catTasks.length === 0 && (
                        <p className="text-xs text-gray-400 italic px-1">Sin tareas con estos filtros</p>
                      )}
                      {(statusFilter === "todos" || statusFilter === "pendiente") && !priorityFilter && (
                        <AddTaskForm
                          instances={instances}
                          defaultInstanceId={instanceFilter}
                          onAdd={(text, _, priority, instanceId) => addTask(text, cat as Category, priority, instanceId)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <InstancePanel
            instances={instances}
            taskCounts={taskCounts}
            onAdd={addInstance}
            onDelete={deleteInstance}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-4 text-center">
        {lastUpdate ? (
          <p className="text-xs text-gray-400">
            Última actualización: {new Date(lastUpdate.at).toLocaleString("es-CL")} por {lastUpdate.by.split("@")[0]}
          </p>
        ) : (
          <p className="text-xs text-gray-400">KD Todos · Tiempo real</p>
        )}
      </footer>
    </div>
  );
}
