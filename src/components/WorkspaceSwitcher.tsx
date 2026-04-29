import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Settings2 } from 'lucide-react';
import type { Workspace } from '../lib/types';
import { useDismiss } from '../hooks/useDismiss';
import s from '../styles/App.module.css';

type Props = {
  workspaces: Workspace[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<void> | void;
  onOpenManage: () => void;
};

export function WorkspaceSwitcher({ workspaces, activeId, onSelect, onCreate, onOpenManage }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const createInputRef = useRef<HTMLInputElement | null>(null);

  const active = workspaces.find((w) => w.id === activeId);

  useDismiss(open, wrapRef, setOpen);

  useEffect(() => {
    if (creating) createInputRef.current?.focus();
  }, [creating]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const submitCreate = async () => {
    const name = draftName.trim();
    if (!name) {
      setCreating(false);
      setDraftName('');
      return;
    }
    await onCreate(name);
    setDraftName('');
    setCreating(false);
    setOpen(false);
  };

  return (
    <div className={s.workspaceSwitcher} ref={wrapRef}>
      <button
        type="button"
        className={s.workspacePill}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Switch workspace"
      >
        <span className={s.workspacePillName}>{active?.name ?? 'Workspace'}</span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      {open && (
        <div className={s.workspacePopover} role="listbox">
          {workspaces.map((w) => (
            <button
              key={w.id}
              type="button"
              role="option"
              aria-selected={w.id === activeId}
              className={`${s.workspacePopoverItem} ${w.id === activeId ? s.workspacePopoverActive : ''}`}
              onClick={() => handleSelect(w.id)}
            >
              <span className={s.workspaceItemCheck}>
                {w.id === activeId && <Check size={14} strokeWidth={2.5} />}
              </span>
              <span className={s.workspaceItemName}>{w.name}</span>
            </button>
          ))}

          <div className={s.workspacePopoverDivider} />

          {creating ? (
            <div className={s.workspaceCreateRow}>
              <Plus size={14} strokeWidth={2} />
              <input
                ref={createInputRef}
                className={s.workspaceCreateInput}
                placeholder="Workspace name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitCreate();
                  if (e.key === 'Escape') {
                    setCreating(false);
                    setDraftName('');
                  }
                }}
                onBlur={submitCreate}
              />
            </div>
          ) : (
            <button
              type="button"
              className={s.workspacePopoverItem}
              onClick={() => setCreating(true)}
            >
              <span className={s.workspaceItemCheck}>
                <Plus size={14} strokeWidth={2} />
              </span>
              <span className={s.workspaceItemName}>New workspace</span>
            </button>
          )}

          <button
            type="button"
            className={s.workspacePopoverItem}
            onClick={() => {
              setOpen(false);
              onOpenManage();
            }}
          >
            <span className={s.workspaceItemCheck}>
              <Settings2 size={14} strokeWidth={2} />
            </span>
            <span className={s.workspaceItemName}>Manage…</span>
          </button>
        </div>
      )}
    </div>
  );
}
