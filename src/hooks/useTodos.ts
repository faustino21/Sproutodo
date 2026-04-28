import { useCallback, useEffect, useState } from 'react';
import type { Todo } from '../lib/types';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    window.api.todos.list().then((t) => {
      setTodos(t);
      setLoaded(true);
    });
  }, []);

  const add = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const todo = await window.api.todos.add(trimmed);
    setTodos((prev) => [todo, ...prev]);
  }, []);

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

  const reorder = useCallback(async (ids: string[]) => {
    setTodos((prev) => {
      const byId = new Map(prev.map((t) => [t.id, t]));
      return ids.map((id) => byId.get(id)).filter((t): t is Todo => !!t);
    });
    try {
      await window.api.todos.reorder(ids);
    } catch {
      const fresh = await window.api.todos.list();
      setTodos(fresh);
    }
  }, []);

  return { todos, loaded, add, toggle, remove, edit, reorder };
}
