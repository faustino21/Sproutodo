import { useState, type KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import s from '../styles/App.module.css';
import plantUrl from '../assets/plant.webp';

export function TodoInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className={s.composer}>
      <img src={plantUrl} alt="" className={s.brandLogo} aria-hidden="true" />
      <div className={s.inputWrap}>
        <Plus size={16} strokeWidth={2.2} />
        <input
          className={s.input}
          placeholder="Add a task…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          autoFocus
        />
      </div>
    </div>
  );
}
