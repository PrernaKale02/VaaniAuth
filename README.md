# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## VaaniAuth conversion (React + Vite + Tailwind)

I converted the `vaaniauth_banking_app.html` demo into a React component and added Tailwind config files. To finish setup locally:

- Install Tailwind and PostCSS deps:

```bash
npm install -D tailwindcss postcss autoprefixer
```

- (Optional) If you haven't already initialized Tailwind, you can run:

```bash
npx tailwindcss init -p
```

- Start the dev server:

```bash
npm run dev
```

Files added/changed:

- `src/components/VaaniAuth.jsx` — React component with UI + logic
- `src/vaaniauth.css` — original styles from the demo
- `tailwind.config.cjs`, `postcss.config.cjs` — Tailwind/PostCSS configs
- `src/index.css` — Tailwind directives added at the top

The app entry is `src/App.jsx` which now renders the `VaaniAuth` component.
