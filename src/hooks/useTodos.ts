import { useCallback, useEffect, useState } from 'react';
import type { Todo } from '../lib/types';

export function useTodos(activeWorkspaceId: string | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!activeWorkspaceId) {
      setTodos([]);
      setLoaded(false);
      return;
    }
    let cancelled = false;
    setLoaded(false);
    window.api.todos.list(activeWorkspaceId).then((t) => {
      if (cancelled) return;
      setTodos(t);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId]);

  const add = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !activeWorkspaceId) return;
      const todo = await window.api.todos.add(trimmed, activeWorkspaceId);
      setTodos((prev) => [todo, ...prev]);
    },
    [activeWorkspaceId],
  );

  const toggle = useCallback(async (id: string) => {
    const updated = await window.api.todos.toggle(id);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const remove = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await window.api.todos.remove(id);
  }, []);

  const edit = useCallback(async (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const updated = await window.api.todos.update(id, trimmed);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const reorder = useCallback(
    async (ids: string[]) => {
      if (!activeWorkspaceId) return;
      setTodos((prev) => {
        const byId = new Map(prev.map((t) => [t.id, t]));
        return ids.map((id) => byId.get(id)).filter((t): t is Todo => !!t);
      });
      try {
        await window.api.todos.reorder(activeWorkspaceId, ids);
      } catch {
        const fresh = await window.api.todos.list(activeWorkspaceId);
        setTodos(fresh);
      }
    },
    [activeWorkspaceId],
  );

  const dropLocal = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const set = new Set(ids);
    setTodos((prev) => prev.filter((t) => !set.has(t.id)));
  }, []);

  const move = useCallback(
    async (id: string, targetWorkspaceId: string) => {
      if (!targetWorkspaceId || targetWorkspaceId === activeWorkspaceId) return;
      setTodos((prev) => prev.filter((t) => t.id !== id));
      try {
        await window.api.todos.move(id, targetWorkspaceId);
      } catch (err) {
        console.error('Failed to move todo', err);
        if (activeWorkspaceId) {
          const fresh = await window.api.todos.list(activeWorkspaceId);
          setTodos(fresh);
        }
      }
    },
    [activeWorkspaceId],
  );

  return { todos, loaded, add, toggle, remove, edit, reorder, move, dropLocal };
}
