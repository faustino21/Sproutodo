# Styling

- Component styles use CSS Modules (`*.module.css`), imported as `s` and applied via `className={s.foo}`.
- Global styles live in `src/styles/global.css`. Do not introduce global classes for component-scoped styling.
- Do not introduce a CSS-in-JS library (styled-components, emotion, etc.), Tailwind, or a UI kit (MUI, Chakra, etc.) without explicit user approval.
- Icons come from `lucide-react`. Prefer it over adding another icon library.
