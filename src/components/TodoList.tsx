import type { Todo } from '../lib/types';
import { TodoItem } from './TodoItem';
import s from '../styles/App.module.css';

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TodoList({ todos, onToggle, onRemove }: Props) {
  const sorted = [...todos].sort((a, b) => Number(a.done) - Number(b.done));
  return (
    <ul className={s.list}>
      {sorted.map((t) => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}
