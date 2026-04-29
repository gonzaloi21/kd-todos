"use client";
import { useState, FormEvent } from "react";
import { Category, Priority, Instance } from "@/lib/types";

const CATEGORIES: Category[] = ["Consumibles", "Neumáticos", "Unilink"];
const PRIORITIES: Priority[] = ["alta", "media", "baja"];

interface AddTaskFormProps {
  instances: Instance[];
  defaultInstanceId?: number | null;
  onAdd: (text: string, category: Category, priority: Priority, instanceId: number | null) => void;
}

export default function AddTaskForm({ instances, defaultInstanceId, onAdd }: AddTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("Consumibles");
  const [priority, setPriority] = useState<Priority>("media");
  const [instanceId, setInstanceId] = useState<number | null>(defaultInstanceId ?? null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), category, priority, instanceId);
    setText("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
      >
        + Nueva tarea
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Descripción de la tarea..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
        >
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={instanceId ?? ""}
          onChange={(e) => setInstanceId(e.target.value ? Number(e.target.value) : null)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
        >
          <option value="">Sin instancia</option>
          {instances.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
          Cancelar
        </button>
        <button type="submit" className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Agregar
        </button>
      </div>
    </form>
  );
}
