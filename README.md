# Account Intel

AI-powered enterprise account research for sales teams.

Turn public account signals into actionable enterprise sales intelligence.

## Getting started

```bash
npm install
npm run dev
```

Open the URL printed by `npm run dev` (usually [http://localhost:3000](http://localhost:3000)).

If port 3000 is already taken (common in Cursor), the app will start on [http://localhost:3001](http://localhost:3001) instead.

## Enable live web research

Create `.env.local` from `.env.example` and add:

```bash
TAVILY_API_KEY=your_tavily_api_key_here
```

Restart `npm run dev`, then research AdventHealth.

**OpenAI is not required right now.**  
The app builds dossier insights from organized live sources using local analysis.

## Status

**Prospecting brief — MEDDPICC + Command of the Message (no OpenAI)**

Flow:

1. Run broader Tavily queries across leadership, hiring, AI, tech, initiatives, financial, news
2. Organize and extract the highest-value signals (not every raw result)
3. Present a clean Executive Brief: value thesis, sourced signals, Why Cursor/Why Now, discovery questions
4. Each signal includes clickable sources plus MEDDPICC and Command of the Message lenses for selling Cursor

OpenAI remains optional for later if you want richer AI writing.

## Repository

https://github.com/madicroteau/Cursor-Prospecting
