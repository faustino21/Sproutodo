import { useEffect, useState } from 'react';
import type { Settings } from '../lib/types';
import s from '../styles/App.module.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

function maskToken(token?: string) {
  if (!token) return '';
  if (token.length <= 8) return token;
  return `${token.slice(0, 7)}••••••${token.slice(-4)}`;
}

export function SettingsDialog({ open, onClose, onSaved }: Props) {
  const [token, setToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [savedToken, setSavedToken] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    window.api.settings.get().then((cur: Settings) => {
      setSavedToken(cur.notionToken);
      setToken('');
      setPageId(cur.notionPageId ?? '');
    });
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const next: Settings = {
        notionToken: token.trim() || savedToken,
        notionPageId: pageId.trim() || undefined,
      };
      await window.api.settings.save(next);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.backdrop} onMouseDown={onClose}>
      <div className={s.modal} onMouseDown={(e) => e.stopPropagation()}>
        <h2 className={s.modalTitle}>Notion settings</h2>
        <p className={s.modalSubtitle}>
          Create an internal integration in Notion, then share your target page with it.
        </p>

        {error && <div className={s.error}>{error}</div>}

        <div className={s.field}>
          <label htmlFor="token">Integration token</label>
          <input
            id="token"
            type="password"
            placeholder={savedToken ? maskToken(savedToken) : 'secret_…'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <span className={s.fieldHint}>
            {savedToken ? 'Leave empty to keep the saved token.' : 'Pasted once, stored locally.'}
          </span>
        </div>

        <div className={s.field}>
          <label htmlFor="pageId">Parent page ID</label>
          <input
            id="pageId"
            type="text"
            placeholder="32-char ID from the page URL"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
          />
          <span className={s.fieldHint}>Reports will be created as sub-pages here.</span>
        </div>

        <div className={s.actions}>
          <button className={`${s.btn} ${s.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
