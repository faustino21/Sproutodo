import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { GripVertical, Pencil, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '../lib/types';
import s from '../styles/App.module.css';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
};

export function TodoItem({ todo, onToggle, onRemove, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  // React fires onBlur during unmount, which would re-fire commit after Enter.
  const settledRef = useRef(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
    disabled: todo.done || editing,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const exitEdit = () => {
    settledRef.current = true;
    setDraft(todo.text);
    setEditing(false);
  };

  const startEdit = () => {
    settledRef.current = false;
    setDraft(todo.text);
    setEditing(true);
  };

  const commit = () => {
    if (settledRef.current) return;
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.text) onEdit(todo.id, trimmed);
    exitEdit();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape') exitEdit();
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${s.item} ${isDragging ? s.dragging : ''}`}
    >
      {todo.done ? (
        <span className={s.dragHandlePlaceholder} aria-hidden />
      ) : (
        <button
          type="button"
          className={`${s.iconAction} ${s.dragHandle}`}
          aria-label="Reorder task"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} strokeWidth={2.2} />
        </button>
      )}
      <input
        type="checkbox"
        className={s.checkbox}
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={todo.done ? 'Mark as incomplete' : 'Mark as complete'}
      />
      {editing ? (
        <input
          className={`${s.itemText} ${s.itemEditInput}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Edit task text"
        />
      ) : (
        <>
          <span className={`${s.itemText} ${todo.done ? s.itemDone : ''}`}>{todo.text}</span>
          <button
            className={`${s.iconAction} ${s.editButton}`}
            onClick={startEdit}
            aria-label="Edit task"
          >
            <Pencil size={13} strokeWidth={2.2} />
          </button>
        </>
      )}
      <button
        className={`${s.iconAction} ${s.delete}`}
        onClick={() => onRemove(todo.id)}
        aria-label="Delete task"
      >
        <X size={14} strokeWidth={2.2} />
      </button>
    </li>
  );
}
