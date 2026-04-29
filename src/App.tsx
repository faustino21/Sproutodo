import { useState } from 'react';
import { Leaf, Settings as SettingsIcon, Send } from 'lucide-react';
import { useTodos } from './hooks/useTodos';
import { useWorkspaces } from './hooks/useWorkspaces';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { EmptyState } from './components/EmptyState';
import { SettingsDialog } from './components/SettingsDialog';
import { ReportDialog } from './components/ReportDialog';
import { WorkspaceSwitcher } from './components/WorkspaceSwitcher';
import { ManageWorkspacesDialog } from './components/ManageWorkspacesDialog';
import s from './styles/App.module.css';

export default function App() {
  const {
    workspaces,
    activeId,
    loaded: wsLoaded,
    setActive,
    create: createWorkspace,
    rename: renameWorkspace,
    remove: removeWorkspace,
  } = useWorkspaces();
  const { todos, loaded, add, toggle, remove, edit, reorder, move, dropLocal } = useTodos(activeId);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; url?: string } | null>(null);

  const showToast = (message: string, url?: string) => {
    setToast({ message, url });
    window.setTimeout(() => setToast(null), 6000);
  };

  const handleDeleteWorkspace = async (id: string) => {
    const result = await removeWorkspace(id);
    dropLocal(result.removedTodoIds);
  };

  return (
    <div className={s.app}>
      <header className={s.header}>
        <div className={s.headerTop}>
          <div className={s.brand}>
            <Leaf size={18} strokeWidth={2} />
            <span>Sproutodo</span>
          </div>
          <div className={s.headerActions}>
            <button
              className={s.iconButton}
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              title="Settings"
            >
              <SettingsIcon size={16} strokeWidth={2} />
            </button>
            <button
              className={s.iconButton}
              onClick={() => setReportOpen(true)}
              aria-label="Send report to Notion"
              title="Send report to Notion"
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
        {wsLoaded && (
          <div className={s.headerSwitcher}>
            <WorkspaceSwitcher
              workspaces={workspaces}
              activeId={activeId}
              onSelect={setActive}
              onCreate={async (name) => {
                await createWorkspace(name);
              }}
              onOpenManage={() => setManageOpen(true)}
            />
          </div>
        )}
      </header>

      {loaded && todos.length === 0 ? (
        <EmptyState />
      ) : (
        <TodoList
          todos={todos}
          onToggle={toggle}
          onRemove={remove}
          onEdit={edit}
          onReorder={reorder}
          workspaces={workspaces}
          activeWorkspaceId={activeId}
          onMove={move}
        />
      )}

      <TodoInput onAdd={add} />

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        workspaceId={activeId}
        onSent={(url, removedIds) => {
          dropLocal(removedIds);
          showToast('Report created', url);
        }}
        onMissingSettings={() => {
          setReportOpen(false);
          setSettingsOpen(true);
          showToast('Add your Notion token and page ID first.');
        }}
      />
      <ManageWorkspacesDialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        workspaces={workspaces}
        onRename={renameWorkspace}
        onDelete={handleDeleteWorkspace}
      />

      {toast && (
        <div className={s.toast}>
          <span>{toast.message}</span>
          {toast.url && (
            <button
              className={s.toastLink}
              onClick={() => window.api.shell.openExternal(toast.url!)}
            >
              Open in Notion ↗
            </button>
          )}
        </div>
      )}
    </div>
  );
}
