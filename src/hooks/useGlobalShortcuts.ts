import { useEffect, useRef } from 'react';
import { isMod, isTypingTarget } from '../lib/keys';

type Options = {
  onFocusAdd: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
  onOpenManage: () => void;
  onShowHelp: () => void;
  onWorkspaceByIndex: (index: number) => void;
  onWorkspaceNext: () => void;
  onWorkspacePrev: () => void;
  isAnyDialogOpen: boolean;
};

export function useGlobalShortcuts(opts: Options) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const o = optsRef.current;
      if (o.isAnyDialogOpen) return;

      const mod = isMod(e);
      const typing = isTypingTarget(e.target);

      if (mod && !e.shiftKey && !e.altKey && e.key === ',') {
        e.preventDefault();
        o.onOpenSettings();
        return;
      }

      if (mod && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        o.onOpenReport();
        return;
      }

      if (mod && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        o.onOpenManage();
        return;
      }

      if (mod && e.shiftKey && e.key === ']') {
        e.preventDefault();
        o.onWorkspaceNext();
        return;
      }
      if (mod && e.shiftKey && e.key === '[') {
        e.preventDefault();
        o.onWorkspacePrev();
        return;
      }

      if (mod && !e.shiftKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        o.onWorkspaceByIndex(Number(e.key) - 1);
        return;
      }

      if (mod && e.key === '/') {
        e.preventDefault();
        o.onShowHelp();
        return;
      }

      if (typing) return;

      if (!mod && !e.altKey && e.key === '?') {
        e.preventDefault();
        o.onShowHelp();
        return;
      }

      if (!mod && !e.altKey && !e.shiftKey && e.key === 'n') {
        e.preventDefault();
        o.onFocusAdd();
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
