# BSU International Student Portal v4

Full-stack Next.js 14 portal for Bowie State University international students.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/bsu-portal.git
cd bsu-portal
cp .env.example .env.local
npm install
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel (3 steps)

1. Push to GitHub
2. Import repo on vercel.com → add the required env vars from `.env.example` (`NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_PROJECT_ID`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, one service-role server key, and Gemini key)
3. Deploy — Root Directory: **blank**

## Supabase Setup

Run `supabase-schema.sql` in your Supabase project's SQL Editor.

## Demo Students (password: `demo1234`)
amina.yusuf · carlos.mendoza · priya.nair · kofi.mensah · linh.tran
sara.alhassan · daniel.okafor · mei.zhang · javier.ruiz · fatima.noor
All @students.bowiestate.edu

## Tech Stack
Next.js 14 · React 18 · Supabase (Auth + DB + Storage) · Google Gemini 2.0 Flash
