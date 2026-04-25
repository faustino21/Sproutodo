import { X } from 'lucide-react';
import type { Todo } from '../lib/types';
import s from '../styles/App.module.css';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onRemove }: Props) {
  return (
    <li className={s.item}>
      <input
        type="checkbox"
        className={s.checkbox}
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={todo.done ? 'Mark as incomplete' : 'Mark as complete'}
      />
      <span className={`${s.itemText} ${todo.done ? s.itemDone : ''}`}>{todo.text}</span>
      <button
        className={s.delete}
        onClick={() => onRemove(todo.id)}
        aria-label="Delete task"
      >
        <X size={14} strokeWidth={2.2} />
      </button>
    </li>
  );
}
