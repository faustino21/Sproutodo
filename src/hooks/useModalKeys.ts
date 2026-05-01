import { useEffect, useRef } from 'react';
import { isMod } from '../lib/keys';

type Options = {
  onClose: () => void;
  onSubmit?: () => void;
};

export function useModalKeys(open: boolean, opts: Options) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const { onClose, onSubmit } = optsRef.current;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (onSubmit && e.key === 'Enter' && isMod(e)) {
        e.preventDefault();
        onSubmit();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
}
