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
import type { Todo } from '../lib/types';
import { TodoItem } from './TodoItem';
import s from '../styles/App.module.css';

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onReorder: (ids: string[]) => void;
};

export function TodoList({ todos, onToggle, onRemove, onEdit, onReorder }: Props) {
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <ul className={s.list}>
          {sorted.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={onToggle}
              onRemove={onRemove}
              onEdit={onEdit}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
