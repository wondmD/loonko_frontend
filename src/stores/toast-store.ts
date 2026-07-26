"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastState = {
  items: ToastItem[];
  push: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

let counter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (input) => {
    const id = `toast-${Date.now()}-${counter++}`;
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "info",
    };
    set((s) => ({ items: [...s.items.slice(-4), item] }));
    const duration = input.durationMs ?? (input.tone === "error" ? 5200 : 3200);
    window.setTimeout(() => {
      get().dismiss(id);
    }, duration);
    return id;
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
  clear: () => set({ items: [] }),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "error" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, tone: "info" }),
};
