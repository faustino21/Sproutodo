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

  return { todos, loaded, add, toggle, remove };
}
