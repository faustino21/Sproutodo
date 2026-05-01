import { modJoin } from '../lib/keys';
import { useModalKeys } from '../hooks/useModalKeys';
import s from '../styles/App.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
};

type Row = { keys: string; label: string };

function buildRows(): Row[] {
  return [
    { keys: 'n', label: 'Focus the add-task input' },
    { keys: 'j  /  ↓', label: 'Move focus to next task' },
    { keys: 'k  /  ↑', label: 'Move focus to previous task' },
    { keys: 'Space  /  x', label: 'Toggle focused task done' },
    { keys: 'e', label: 'Edit focused task' },
    { keys: 'Delete  /  ⌫', label: 'Delete focused task' },
    { keys: 'm', label: 'Move focused task to another workspace' },
    { keys: modJoin(','), label: 'Open Settings' },
    { keys: modJoin('⇧R', 'Shift+R'), label: 'Open Send Report dialog' },
    { keys: modJoin('⇧M', 'Shift+M'), label: 'Open Manage Workspaces' },
    { keys: `${modJoin('1')} … ${modJoin('9')}`, label: 'Switch to workspace by index' },
    {
      keys: `${modJoin('⇧]', 'Shift+]')}  /  ${modJoin('⇧[', 'Shift+[')}`,
      label: 'Next / previous workspace',
    },
    { keys: modJoin('Enter'), label: 'Submit dialog (Save / Send)' },
    { keys: `?  /  ${modJoin('/')}`, label: 'Show this help' },
    { keys: 'Esc', label: 'Close dialog or popover' },
  ];
}

export function ShortcutsHelpDialog({ open, onClose }: Props) {
  useModalKeys(open, { onClose });
  if (!open) return null;
  const rows = buildRows();
  return (
    <div className={s.backdrop} onMouseDown={onClose}>
      <div
        className={`${s.modal} ${s.helpModal}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className={s.modalTitle}>Keyboard shortcuts</h2>
        <p className={s.modalSubtitle}>Single-letter shortcuts work when no input is focused.</p>
        <ul className={s.shortcutList}>
          {rows.map((r) => (
            <li key={r.label} className={s.shortcutRow}>
              <kbd className={s.shortcutKeys}>{r.keys}</kbd>
              <span className={s.shortcutLabel}>{r.label}</span>
            </li>
          ))}
        </ul>
        <div className={s.actions}>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
