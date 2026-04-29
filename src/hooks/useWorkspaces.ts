import { useCallback, useEffect, useState } from 'react';
import type { Workspace } from '../lib/types';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [ws, settings] = await Promise.all([
        window.api.workspaces.list(),
        window.api.settings.get(),
      ]);
      if (cancelled) return;
      setWorkspaces(ws);
      const fallback = ws[0]?.id ?? null;
      const active = settings.activeWorkspaceId && ws.some((w) => w.id === settings.activeWorkspaceId)
        ? settings.activeWorkspaceId
        : fallback;
      setActiveId(active);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setActive = useCallback(async (id: string) => {
    setActiveId(id);
    const cur = await window.api.settings.get();
    await window.api.settings.save({ ...cur, activeWorkspaceId: id });
  }, []);

  const create = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Workspace name cannot be empty');
    const ws = await window.api.workspaces.create(trimmed);
    setWorkspaces((prev) => [...prev, ws]);
    setActiveId(ws.id);
    const cur = await window.api.settings.get();
    await window.api.settings.save({ ...cur, activeWorkspaceId: ws.id });
    return ws;
  }, []);

  const rename = useCallback(async (id: string, name: string) => {
    const updated = await window.api.workspaces.rename(id, name);
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? updated : w)));
  }, []);

  const remove = useCallback(
    async (id: string) => {
      const result = await window.api.workspaces.remove(id);
      let nextActive: string | null = activeId;
      setWorkspaces((prev) => {
        const next = prev.filter((w) => w.id !== id);
        if (activeId === id) nextActive = next[0]?.id ?? null;
        return next;
      });
      if (nextActive !== activeId) setActiveId(nextActive);
      return result;
    },
    [activeId],
  );

  return { workspaces, activeId, loaded, setActive, create, rename, remove };
}
