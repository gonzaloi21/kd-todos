"use client";
import { useState, FormEvent } from "react";
import { Instance, InstanceType } from "@/lib/types";

const TYPE_LABELS: Record<InstanceType, string> = {
  reunion: "Reunión",
  entrega: "Entrega",
  deadline: "Deadline",
  otro: "Otro",
};

const TYPE_ICONS: Record<InstanceType, string> = {
  reunion: "🤝",
  entrega: "📦",
  deadline: "⏰",
  otro: "📌",
};

interface InstancePanelProps {
  instances: Instance[];
  taskCounts: Record<number, number>;
  onAdd: (name: string, type: InstanceType, date: string | null) => void;
  onDelete: (id: number) => void;
}

export default function InstancePanel({ instances, taskCounts, onAdd, onDelete }: InstancePanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<InstanceType>("reunion");
  const [date, setDate] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), type, date || null);
    setName(""); setType("reunion"); setDate("");
    setShowForm(false);
  };

  return (
    <div className="space-y-2">
      {instances.map((inst) => (
        <div key={inst.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">{TYPE_ICONS[inst.type as InstanceType]}</span>
              <span className="text-sm font-medium text-gray-800">{inst.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{TYPE_LABELS[inst.type as InstanceType]}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {inst.date && <span className="text-xs text-gray-400">{inst.date}</span>}
              <span className="text-xs text-gray-400">{taskCounts[inst.id] ?? 0} tareas</span>
            </div>
          </div>
          <button
            onClick={() => { if (confirm(`¿Eliminar "${inst.name}"? Las tareas asociadas quedarán sin instancia.`)) onDelete(inst.id); }}
            className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la instancia..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as InstanceType)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100">Cancelar</button>
            <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Crear</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full text-left px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >
          + Nueva instancia
        </button>
      )}
    </div>
  );
}
