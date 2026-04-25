import { useState } from 'react';
import { Leaf, Settings as SettingsIcon, Send } from 'lucide-react';
import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { EmptyState } from './components/EmptyState';
import { SettingsDialog } from './components/SettingsDialog';
import { ReportDialog } from './components/ReportDialog';
import s from './styles/App.module.css';

export default function App() {
  const { todos, loaded, add, toggle, remove } = useTodos();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; url?: string } | null>(null);

  const showToast = (message: string, url?: string) => {
    setToast({ message, url });
    window.setTimeout(() => setToast(null), 6000);
  };

  return (
    <div className={s.app}>
      <header className={s.header}>
        <div className={s.brand}>
          <Leaf size={18} strokeWidth={2} />
          <span>simple todo</span>
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
      </header>

      {loaded && todos.length === 0 ? (
        <EmptyState />
      ) : (
        <TodoList todos={todos} onToggle={toggle} onRemove={remove} />
      )}

      <TodoInput onAdd={add} />

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSent={(url) => showToast('Report created', url)}
        onMissingSettings={() => {
          setReportOpen(false);
          setSettingsOpen(true);
          showToast('Add your Notion token and page ID first.');
        }}
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
