import { useCallback, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { Todo, Workspace } from '../lib/types';
import { TodoItem } from './TodoItem';
import { useListNav } from '../hooks/useListNav';
import s from '../styles/App.module.css';

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onReorder: (ids: string[]) => void;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onMove: (id: string, workspaceId: string) => void;
};

export function TodoList({
  todos,
  onToggle,
  onRemove,
  onEdit,
  onReorder,
  workspaces,
  activeWorkspaceId,
  onMove,
}: Props) {
  const sorted = [...todos].sort((a, b) => Number(a.done) - Number(b.done));
  const sortedIds = sorted.map((t) => t.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedIds.indexOf(String(active.id));
    const newIndex = sortedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(sortedIds, oldIndex, newIndex));
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [moveOpenId, setMoveOpenId] = useState<string | null>(null);

  const startEdit = useCallback((id: string) => setEditingId(id), []);
  const openMove = useCallback((id: string) => setMoveOpenId(id), []);

  const onListKeyDown = useListNav({
    onToggle,
    onRemove,
    onStartEdit: startEdit,
    onOpenMove: openMove,
  });

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <ul className={s.list} onKeyDown={onListKeyDown}>
          {sorted.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={onToggle}
              onRemove={onRemove}
              onEdit={onEdit}
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onMove={onMove}
              editing={editingId === t.id}
              onEditingChange={(editing) => setEditingId(editing ? t.id : null)}
              moveOpen={moveOpenId === t.id}
              onMoveOpenChange={(open) => setMoveOpenId(open ? t.id : null)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
