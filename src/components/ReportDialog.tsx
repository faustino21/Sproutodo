import { useEffect, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import s from '../styles/App.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  workspaceId: string | null;
  onSent: (url: string, removedIds: string[]) => void;
  onMissingSettings: () => void;
};

function toIsoDate(d: Date) {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return tz.toISOString().slice(0, 10);
}

function formatRange(r: DateRange | undefined) {
  if (!r?.from) return 'Pick a day or range to include.';
  if (!r.to || r.from.getTime() === r.to.getTime()) {
    return `Reporting ${toIsoDate(r.from)}`;
  }
  return `Reporting ${toIsoDate(r.from)} → ${toIsoDate(r.to)}`;
}

export function ReportDialog({ open, onClose, workspaceId, onSent, onMissingSettings }: Props) {
  const today = new Date();
  const [range, setRange] = useState<DateRange | undefined>({ from: today, to: today });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clearCompleted, setClearCompleted] = useState(false);

  useEffect(() => {
    if (open) {
      setRange({ from: new Date(), to: new Date() });
      setError(null);
      setClearCompleted(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSend = async () => {
    if (!range?.from || !workspaceId) return;
    const settings = await window.api.settings.get();
    if (!settings.notionToken || !settings.notionPageId) {
      onMissingSettings();
      return;
    }

    setSending(true);
    setError(null);
    try {
      const from = toIsoDate(range.from);
      const to = toIsoDate(range.to ?? range.from);
      const result = await window.api.notion.sendReport(
        { from, to },
        clearCompleted,
        workspaceId,
      );
      onSent(result.url, result.removedIds);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send report.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={s.backdrop} onMouseDown={onClose}>
      <div className={s.modal} onMouseDown={(e) => e.stopPropagation()}>
        <h2 className={s.modalTitle}>Send report to Notion</h2>
        <p className={s.modalSubtitle}>Pick the dates you want to include.</p>

        {error && <div className={s.error}>{error}</div>}

        <div className={s.dateRange}>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            showOutsideDays
          />
        </div>

        <p className={s.rangeSummary}>{formatRange(range)}</p>

        <label className={s.clearOption}>
          <input
            type="checkbox"
            checked={clearCompleted}
            onChange={(e) => setClearCompleted(e.target.checked)}
          />
          <span>Clear completed tasks after sending</span>
        </label>

        <div className={s.actions}>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            onClick={handleSend}
            disabled={sending || !range?.from || !workspaceId}
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
