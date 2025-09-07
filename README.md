# Zakatinator

Privacy-first Zakat calculator built with React, Vite, and shadcn/ui.

## Run locally

Prereqs: Node.js 18+ and npm

```bash
npm install
npm run dev
```

Visit http://localhost:8080

## Build

```bash
npm run build
```

Outputs to `dist/`.

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback is configured via `netlify.toml` and `public/_redirects`.

## Tech stack
- React 18, TypeScript, Vite 5
- Tailwind CSS + shadcn/ui
- Radix UI primitives

## License
MIT
