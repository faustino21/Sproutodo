import { useCallback, type KeyboardEvent } from 'react';
import { isMod, isTypingTarget } from '../lib/keys';

type Options = {
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onStartEdit: (id: string) => void;
  onOpenMove: (id: string) => void;
};

function moveFocus(current: HTMLElement, dir: 1 | -1) {
  const list = current.closest('ul');
  if (!list) return;
  const items = Array.from(list.querySelectorAll<HTMLElement>('[data-todo-id]'));
  const i = items.indexOf(current);
  if (i < 0) return;
  items[i + dir]?.focus();
}

export function useListNav({ onToggle, onRemove, onStartEdit, onOpenMove }: Options) {
  return useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      if (isTypingTarget(e.target)) return;
      if (isMod(e) || e.altKey) return;

      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const li = target.closest<HTMLElement>('[data-todo-id]');
      if (!li || target !== li) return;

      const id = li.dataset.todoId;
      if (!id) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          moveFocus(li, 1);
          return;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          moveFocus(li, -1);
          return;
        case 'x':
        case ' ':
          e.preventDefault();
          onToggle(id);
          return;
        case 'e':
          e.preventDefault();
          onStartEdit(id);
          return;
        case 'm':
          e.preventDefault();
          onOpenMove(id);
          return;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onRemove(id);
          return;
      }
    },
    [onToggle, onRemove, onStartEdit, onOpenMove],
  );
}
