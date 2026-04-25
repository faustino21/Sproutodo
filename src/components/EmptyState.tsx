import s from '../styles/App.module.css';

export function EmptyState() {
  return (
    <div className={s.empty}>
      <p>All clear. Add your first task below.</p>
    </div>
  );
}
