import { useEffect, useState } from 'react';
import type { Settings, UpdaterStatus } from '../lib/types';
import { useModalKeys } from '../hooks/useModalKeys';
import s from '../styles/App.module.css';

function statusLabel(status: UpdaterStatus): string {
  switch (status.kind) {
    case 'idle':
      return 'Up to date.';
    case 'unsupported-dev':
      return 'Updates are disabled in dev mode.';
    case 'checking':
      return 'Checking for updates…';
    case 'not-available':
      return 'You’re on the latest version.';
    case 'available':
      return `Update available — v${status.version}.`;
    case 'downloading':
      return `Downloading… ${status.percent}%`;
    case 'downloaded':
      return `v${status.version} ready to install.`;
    case 'error':
      return `Update error: ${status.message}`;
  }
}

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
  const [appVersion, setAppVersion] = useState('');
  const [updaterStatus, setUpdaterStatus] = useState<UpdaterStatus>({ kind: 'idle' });

  useEffect(() => {
    if (!open) return;
    setError(null);
    window.api.settings.get().then((cur: Settings) => {
      setSavedToken(cur.notionToken);
      setToken('');
      setPageId(cur.notionPageId ?? '');
    });
    window.api.updater.getState().then(({ status, appVersion }) => {
      setUpdaterStatus(status);
      setAppVersion(appVersion);
    });
    const unsubscribe = window.api.updater.onStatus(setUpdaterStatus);
    return unsubscribe;
  }, [open]);

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

  useModalKeys(open, { onClose, onSubmit: handleSave });

  if (!open) return null;

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

        <div className={s.aboutSection}>
          <div className={s.aboutHeader}>
            <div>
              <h3 className={s.aboutTitle}>About</h3>
              {appVersion && <div className={s.aboutVersion}>Version {appVersion}</div>}
            </div>
            {updaterStatus.kind !== 'unsupported-dev' && updaterStatus.kind !== 'downloaded' && (
              <button
                className={s.btnGhost}
                onClick={() => window.api.updater.check()}
                disabled={
                  updaterStatus.kind === 'checking' ||
                  updaterStatus.kind === 'available' ||
                  updaterStatus.kind === 'downloading'
                }
              >
                {updaterStatus.kind === 'checking' ? 'Checking…' : 'Check for updates'}
              </button>
            )}
          </div>

          <div className={updaterStatus.kind === 'error' ? s.aboutError : s.aboutStatus}>
            {statusLabel(updaterStatus)}
          </div>

          {updaterStatus.kind === 'downloading' && (
            <div className={s.progressTrack}>
              <div
                className={s.progressFill}
                style={{ width: `${updaterStatus.percent}%` }}
              />
            </div>
          )}

          {updaterStatus.kind === 'downloaded' && (
            <button
              className={`${s.btn} ${s.btnPrimary}`}
              onClick={() => window.api.updater.quitAndInstall()}
            >
              Install &amp; restart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
