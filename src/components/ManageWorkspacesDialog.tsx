import { useEffect, useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { Workspace } from '../lib/types';
import { useModalKeys } from '../hooks/useModalKeys';
import s from '../styles/App.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ManageWorkspacesDialog({ open, onClose, workspaces, onRename, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      setEditingId(null);
      setDraftName('');
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all(workspaces.map((w) => window.api.todos.list(w.id))).then((lists) => {
      if (cancelled) return;
      const next: Record<string, number> = {};
      workspaces.forEach((w, i) => {
        next[w.id] = lists[i].length;
      });
      setCounts(next);
    });
    return () => {
      cancelled = true;
    };
  }, [open, workspaces]);

  useModalKeys(open, { onClose });

  if (!open) return null;

  const startEdit = (w: Workspace) => {
    setEditingId(w.id);
    setDraftName(w.name);
    setError(null);
  };

  const commitEdit = async () => {
    if (!editingId) return;
    const name = draftName.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    try {
      await onRename(editingId, name);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename.');
    }
  };

  const handleDeleteClick = async (w: Workspace) => {
    if (workspaces.length <= 1) return;
    const count = counts[w.id] ?? 0;
    const message =
      count === 0
        ? `Delete "${w.name}"?`
        : `Delete "${w.name}" and its ${count} todo${count === 1 ? '' : 's'}?`;
    if (!window.confirm(message)) return;
    try {
      await onDelete(w.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete.');
    }
  };

  return (
    <div className={s.backdrop} onMouseDown={onClose}>
      <div className={s.modal} onMouseDown={(e) => e.stopPropagation()}>
        <h2 className={s.modalTitle}>Manage workspaces</h2>
        <p className={s.modalSubtitle}>Rename or delete your workspaces.</p>

        {error && <div className={s.error}>{error}</div>}

        <ul className={s.workspaceManageList}>
          {workspaces.map((w) => (
            <li key={w.id} className={s.workspaceManageRow}>
              {editingId === w.id ? (
                <>
                  <input
                    autoFocus
                    className={s.workspaceManageInput}
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        commitEdit();
                      }
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setEditingId(null);
                      }
                    }}
                  />
                  <button
                    className={s.iconAction}
                    onClick={commitEdit}
                    aria-label="Save"
                    title="Save"
                  >
                    <Check size={16} strokeWidth={2} />
                  </button>
                  <button
                    className={s.iconAction}
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel"
                    title="Cancel"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                </>
              ) : (
                <>
                  <span className={s.workspaceManageName}>{w.name}</span>
                  <button
                    className={s.iconAction}
                    onClick={() => startEdit(w)}
                    aria-label="Rename"
                    title="Rename"
                  >
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  <button
                    className={s.iconAction}
                    onClick={() => handleDeleteClick(w)}
                    aria-label="Delete"
                    title={
                      workspaces.length <= 1 ? 'Cannot delete the only workspace' : 'Delete'
                    }
                    disabled={workspaces.length <= 1}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className={s.actions}>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
