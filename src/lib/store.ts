import { useCallback, useEffect, useState } from "react";
import type { Project } from "./types";

const KEY = "docstudio.projects.v1";
const listeners = new Set<() => void>();

function read(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

function write(projects: Project[]) {
  window.localStorage.setItem(KEY, JSON.stringify(projects));
  listeners.forEach((l) => l());
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function listProjects() {
  return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getProject(id: string) {
  return read().find((p) => p.id === id) ?? null;
}

export function saveProject(project: Project) {
  const all = read();
  const next = { ...project, updatedAt: new Date().toISOString() };
  const i = all.findIndex((p) => p.id === project.id);
  if (i === -1) all.push(next);
  else all[i] = next;
  write(all);
  return next;
}

export function deleteProject(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function createProject(input: Partial<Project>): Project {
  const now = new Date().toISOString();
  const project: Project = {
    id: uid("proj"),
    name: input.name ?? "Untitled documentary",
    videoTitle: input.videoTitle ?? "",
    targetMinutes: input.targetMinutes ?? 25,
    aspectRatio: input.aspectRatio ?? "16:9",
    category: input.category ?? "Finance",
    style: input.style ?? "Cinematic financial documentary",
    audience: input.audience ?? "",
    script: input.script ?? "",
    scenes: [],
    assets: [],
    claims: [],
    voiceover: null,
    createdAt: now,
    updatedAt: now,
  };
  saveProject(project);
  return project;
}

function useStoreVersion() {
  const [, setV] = useState(0);
  useEffect(() => {
    const l = () => setV((v) => v + 1);
    listeners.add(l);
    return () => listeners.delete(l) as unknown as void;
  }, []);
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    const sync = () => setProjects(listProjects());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return projects;
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const sync = () => {
      setProject(getProject(id));
      setLoaded(true);
    };
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, [id]);

  const update = useCallback(
    (mutate: (p: Project) => Project) => {
      const current = getProject(id);
      if (!current) return;
      saveProject(mutate(structuredClone(current)));
    },
    [id],
  );

  return { project, loaded, update };
}

export { useStoreVersion };
