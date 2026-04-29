"use client";
import { useEffect, useState } from "react";
import { ref, onValue, push, set, remove, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Task, Instance, TaskStatus, Priority, Category, InstanceType } from "@/lib/types";
import { seedIfEmpty } from "@/lib/seed";

export function useDatabase(userEmail: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{ at: number; by: string } | null>(null);

  useEffect(() => {
    seedIfEmpty();

    const connRef = ref(db, ".info/connected");
    const unsubConn = onValue(connRef, (snap) => setConnected(!!snap.val()));

    const tasksRef = ref(db, "state/tasks");
    const unsubTasks = onValue(tasksRef, (snap) => {
      const data = snap.val();
      if (!data) { setTasks([]); return; }
      const list = Object.values(data) as Task[];
      list.sort((a, b) => a.createdAt - b.createdAt);
      setTasks(list);
      const latest = list.reduce((max, t) => t.updatedAt > max.updatedAt ? t : max, list[0]);
      if (latest) setLastUpdate({ at: latest.updatedAt, by: latest.updatedBy });
    });

    const instRef = ref(db, "state/instances");
    const unsubInst = onValue(instRef, (snap) => {
      const data = snap.val();
      if (!data) { setInstances([]); return; }
      const list = Object.values(data) as Instance[];
      list.sort((a, b) => a.createdAt - b.createdAt);
      setInstances(list);
    });

    return () => { unsubConn(); unsubTasks(); unsubInst(); };
  }, []);

  const addTask = async (text: string, category: Category, priority: Priority, instanceId: number | null) => {
    const id = Date.now();
    const task: Task = { id, text, category, priority, status: "pendiente", instanceId, createdAt: id, updatedAt: id, updatedBy: userEmail };
    await set(ref(db, `state/tasks/${id}`), task);
  };

  const updateTask = async (id: number, changes: Partial<Task>) => {
    await update(ref(db, `state/tasks/${id}`), { ...changes, updatedAt: Date.now(), updatedBy: userEmail });
  };

  const deleteTask = async (id: number) => {
    await remove(ref(db, `state/tasks/${id}`));
  };

  const addInstance = async (name: string, type: InstanceType, date: string | null) => {
    const id = Date.now();
    const inst: Instance = { id, name, type, date, createdAt: id };
    await set(ref(db, `state/instances/${id}`), inst);
  };

  const deleteInstance = async (id: number) => {
    await remove(ref(db, `state/instances/${id}`));
    // detach tasks from this instance
    const toUpdate = tasks.filter((t) => t.instanceId === id);
    await Promise.all(toUpdate.map((t) => update(ref(db, `state/tasks/${t.id}`), { instanceId: null, updatedAt: Date.now(), updatedBy: userEmail })));
  };

  return { tasks, instances, connected, lastUpdate, addTask, updateTask, deleteTask, addInstance, deleteInstance };
}
