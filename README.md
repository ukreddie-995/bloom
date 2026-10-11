# StudyBloom

A polished, frontend-first academic skill-building demo. Notes, chat responses, and study-partner matching run entirely in the browser; the Spring Boot service is an independent structural stub and is not required to run the UI.

## Run the frontend

Requirements: Node.js 18.18+ and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). `npm run build` creates a production bundle in `dist/`.

The dashboard seeds sample course notes and saves changes to browser `localStorage`. The demo sign-in is `alex@studybloom.demo` / `bloom2026`; it is a client-side gate for evaluation only, not real authentication. Notes, sign-in state, and composed demo messages are saved in browser storage. The message center does not deliver email and no password is stored.

Bloom uses local topic/keyword matching and includes prompts about reversing linked lists and bubble sort. The Practice Lab visualizes both algorithms step by step with pseudocode, playback, and quizzes. Partner discovery uses mock profiles and a simulated search delay. No API key, external AI provider, or backend is required for the frontend.

## Deploy the demo to Vercel

This repository is a Vite static frontend. Import the repository into Vercel and keep these project settings (also recorded in `vercel.json`):

- **Framework preset:** Vite
- **Install command:** `npm ci`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Root directory:** `./` (the repository root)

Use the `main` branch for production deployments and Vercel preview deployments for pull requests. Vercel serves the built frontend; the rewrite keeps client-side routes working on refresh. There are no required environment variables. The demo login, tutor answers, local messages, partner matches, and notes run in the browser, so the Java stub does not need to be deployed.

**Demo limitations to make clear:** The login is not authentication and uses a public, fixed demo password. Do not use it to protect private data. `localStorage` is isolated to a browser/device, does not sync between visitors, and may be cleared by the browser. The mail page only stores a local sent-message example; it does not deliver email. The tutor is a keyword-matched simulation, not a hosted LLM. Do not put a real AI-provider secret in frontend code or a `VITE_*` variable, because client-exposed Vite variables are bundled for visitors.

The Spring Boot service under `backend/` is a separate, optional stub; Vercel’s static frontend deployment does not run that Maven application. If you later connect a hosted backend or real email/AI service, deploy it separately and put secret credentials on that server—not in the browser bundle.

## Run the backend stub (optional)

Requirements: Java 17+ and Maven.

```sh
cd backend
mvn spring-boot:run
```

The stub exposes `GET /api/health` and `GET /api/notes`. It returns generic example JSON and is intentionally not connected to the frontend or intended to host application logic.

## Plug in premium UI components

This Vite app is configured for TypeScript, Tailwind CSS 3, and shadcn/ui conventions. The shadcn component path is `src/components/ui/`; the import alias `@/components/ui/...` is configured in Vite and TypeScript. The shadcn utility is `src/lib/utils.ts`. `src/tailwind.css` contains Tailwind directives while the existing design system remains in `src/styles.css`.

To add shadcn components, use the configured paths (for example `npx shadcn@latest add button`). If adopting shadcn in another project without these paths, initialize TypeScript and Tailwind first, configure the `@/*` alias and `components.json`, and set the UI alias to `@/components/ui`. Keeping shared primitives under `src/components/ui/` makes shadcn CLI generation and consistent imports straightforward.

The app keeps product behavior in `src/context/AppContext.tsx` and page composition in `src/App.tsx`; visual building blocks are in `src/components/` and design tokens/layout styles are in `src/styles.css`.

1. Install your component library and its peer dependencies.
2. Adapt the small primitives in `src/components/UI.tsx` (`Button`, `Card`, `Modal`, `Avatar`, and `Badge`) to wrap your library components, preserving props and accessible button/dialog semantics.
3. The animated hero effect is in `src/components/ui/etheral-shadow.tsx`; change its props where it is used rather than coupling it to page state.
4. Keep page-level components and `AppContext` unchanged unless the library requires different event/controlled-value props. Map those differences at the component boundary.
5. Replace design tokens in `src/styles.css` with your own, and remove only styles that your library now owns.

This adapter-style boundary lets you change the visual system without coupling note storage, tutor simulation, or matching behavior to a UI vendor.
