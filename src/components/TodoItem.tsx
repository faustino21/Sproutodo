import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { FolderInput, GripVertical, Pencil, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo, Workspace } from '../lib/types';
import { useDismiss } from '../hooks/useDismiss';
import s from '../styles/App.module.css';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onMove: (id: string, workspaceId: string) => void;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  moveOpen: boolean;
  onMoveOpenChange: (open: boolean) => void;
};

export function TodoItem({
  todo,
  onToggle,
  onRemove,
  onEdit,
  workspaces,
  activeWorkspaceId,
  onMove,
  editing,
  onEditingChange,
  moveOpen,
  onMoveOpenChange,
}: Props) {
  const [draft, setDraft] = useState(todo.text);
  const moveWrapRef = useRef<HTMLDivElement | null>(null);
  // React fires onBlur during unmount, which would re-fire commit after Enter.
  const settledRef = useRef(false);

  const otherWorkspaces = workspaces.filter((w) => w.id !== activeWorkspaceId);
  const canMove = otherWorkspaces.length > 0;

  useDismiss(moveOpen, moveWrapRef, onMoveOpenChange);

  useEffect(() => {
    if (editing) {
      settledRef.current = false;
      setDraft(todo.text);
    }
  }, [editing, todo.text]);

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
    onEditingChange(false);
  };

  const startEdit = () => {
    onEditingChange(true);
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
      tabIndex={0}
      data-todo-id={todo.id}
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
      {canMove && !editing && (
        <div className={s.moveWrap} ref={moveWrapRef}>
          <button
            type="button"
            className={`${s.iconAction} ${s.moveButton}`}
            onClick={() => onMoveOpenChange(!moveOpen)}
            aria-label="Move to workspace"
            aria-haspopup="listbox"
            aria-expanded={moveOpen}
            title="Move to workspace"
          >
            <FolderInput size={14} strokeWidth={2.2} />
          </button>
          {moveOpen && (
            <div className={s.movePopover} role="listbox">
              <div className={s.movePopoverHeader}>Move to…</div>
              {otherWorkspaces.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={s.workspacePopoverItem}
                  onClick={() => {
                    onMoveOpenChange(false);
                    onMove(todo.id, w.id);
                  }}
                >
                  <span className={s.workspaceItemName}>{w.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
