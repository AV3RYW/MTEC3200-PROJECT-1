# Puzzle Alarm

An early-stage browser-based alarm project. The product requirements are in [`PRD.md`](./PRD.md), and supporting research is in [`docs/research/`](./docs/research/).

## Project structure

```text
.
├── app/                       # Main Next.js App Router application
│   ├── favicon.ico
│   ├── globals.css
│   ├── alarm/                  # Active puzzle alarm screen and interaction
│   │   ├── alarm-screen.tsx
│   │   └── page.tsx
│   ├── settings/              # Alarm configuration screen
│   ├── alarm-controller.tsx   # Checks for due alarms while the app is open
│   ├── home-screen.tsx
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── alarm.ts               # Alarm settings storage and scheduling helpers
├── docs/
│   └── research/              # Product research, notes, and design references
├── myproject1AveryW/          # Separate nested Next.js app with its own package.json
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── public/
├── public/                    # Static assets for the main app
├── .github/skills/            # Repository-specific agent skills
├── AGENTS-templates.md
├── AGENTS.md
├── CLAUDE.md
├── PRD.md
├── package.json               # Main app scripts and dependencies
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── tsconfig.json
```

The main app and its npm scripts are at the repository root. `myproject1AveryW/` is a separate nested app with its own dependencies and configuration; root-level commands do not run it.

## Run the main app

Install dependencies and start the development server from the repository root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser. Other available scripts are `npm run build`, `npm run start`, and `npm run lint`.
