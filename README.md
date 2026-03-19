# Study Vault

Campus notes sharing platform. Share, discover, and download study notes across all semesters. Community-driven.

## Features
- Browse notes by subject/semester
- User ratings and comments
- Upload your own notes (PDF support)
- Auth with Supabase
- Responsive design

## Tech Stack
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Vite
- React Router
- Supabase (auth, DB, storage)
- TanStack Query
- Recharts

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:8080

## Development

- \`npm run dev\`: Start dev server
- \`npm run build\`: Build for production
- \`npm run lint\`: Lint code

## Deployment

Deploy to:
- Vercel/Netlify (connect GitHub repo)
- Any static host (after \`npm run build\`)

## Project Structure
\`\`\`
src/
├── components/     # UI components + shadcn
├── hooks/          # Custom React hooks (queries, auth)
├── pages/          # Page components
├── integrations/   # Supabase client/types
└── lib/            # Utils, constants
\`\`\`

Enjoy building!
