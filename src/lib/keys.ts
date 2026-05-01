const isMac = /Mac|iPhone|iPad|iPod/.test(
  typeof navigator !== 'undefined' ? navigator.platform || navigator.userAgent : '',
);

export function isMod(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return isMac ? e.metaKey : e.ctrlKey;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function modLabel(): string {
  return isMac ? '⌘' : 'Ctrl';
}

export function modJoin(macKey: string, winKey: string = macKey): string {
  return isMac ? `⌘${macKey}` : `Ctrl+${winKey}`;
}
