"use client";
import { useState, useRef, useEffect } from "react";
import { Task, Instance, TaskStatus } from "@/lib/types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: "Pendiente",
  progreso: "En progreso",
  bloqueado: "Bloqueado",
  completado: "Completado",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  pendiente: "bg-gray-100 text-gray-700",
  progreso: "bg-blue-100 text-blue-700",
  bloqueado: "bg-red-100 text-red-700",
  completado: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-yellow-100 text-yellow-700",
  baja: "bg-gray-100 text-gray-600",
};

const INSTANCE_TYPE_ICONS: Record<string, string> = {
  reunion: "🤝",
  entrega: "📦",
  deadline: "⏰",
  otro: "📌",
};

interface TaskCardProps {
  task: Task;
  instances: Instance[];
  onUpdate: (id: number, changes: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, instances, onUpdate, onDelete }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const saveEdit = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onUpdate(task.id, { text: editText.trim() });
    }
    setEditing(false);
  };

  const instance = instances.find((i) => i.id === task.instanceId);

  const cardClass = [
    "bg-white rounded-xl border p-4 transition-all",
    task.status === "bloqueado" ? "border-red-200 bg-red-50" : "border-gray-200",
    task.status === "completado" ? "opacity-60" : "",
  ].join(" ");

  return (
    <div className={cardClass}>
      <div className="flex items-start gap-3">
        {/* Status circle */}
        <button
          onClick={() => {
            const next: Record<TaskStatus, TaskStatus> = { pendiente: "progreso", progreso: "completado", completado: "pendiente", bloqueado: "pendiente" };
            onUpdate(task.id, { status: next[task.status] });
          }}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 ${task.status === "completado" ? "bg-green-500 border-green-500" : task.status === "progreso" ? "border-blue-500" : task.status === "bloqueado" ? "border-red-400" : "border-gray-300"} hover:opacity-80 transition-opacity`}
          title="Click para avanzar estado"
        >
          {task.status === "completado" && <span className="text-white text-xs flex items-center justify-center h-full">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") { setEditing(false); setEditText(task.text); } }}
              className="w-full text-sm bg-white border border-blue-400 rounded px-2 py-0.5 focus:outline-none"
            />
          ) : (
            <p
              onClick={() => { setEditing(true); setEditText(task.text); }}
              className={`text-sm cursor-text hover:text-blue-700 ${task.status === "completado" ? "line-through text-gray-400" : "text-gray-800"}`}
              title="Click para editar"
            >
              {task.text}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Status badge */}
            <select
              value={task.status}
              onChange={(e) => onUpdate(task.id, { status: e.target.value as TaskStatus })}
              className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[task.status]}`}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>

            {/* Priority */}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>

            {/* Instance */}
            {instance && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                {INSTANCE_TYPE_ICONS[instance.type]} {instance.name}
              </span>
            )}

            {/* Instance selector */}
            <select
              value={task.instanceId ?? ""}
              onChange={(e) => onUpdate(task.id, { instanceId: e.target.value ? Number(e.target.value) : null })}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border-0 cursor-pointer"
            >
              <option value="">Sin instancia</option>
              {instances.map((inst) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
            </select>
          </div>

          {task.updatedBy && task.updatedBy !== "system" && (
            <p className="text-xs text-gray-400 mt-1.5">
              {task.updatedBy.split("@")[0]} · {new Date(task.updatedAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0"
          title="Eliminar tarea"
        >
          ×
        </button>
      </div>
    </div>
  );
}
