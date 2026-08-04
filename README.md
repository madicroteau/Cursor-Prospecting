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

## Enable live web research (Step 5)

1. Create a free API key at [tavily.com](https://tavily.com)
2. Copy `.env.example` to `.env.local`
3. Paste your key:

```bash
TAVILY_API_KEY=your_tavily_api_key_here
```

4. Restart `npm run dev`
5. Research AdventHealth and confirm the **Live Web Research** section shows real source links

Without a key, the app still works using mock/sample dossier content and shows setup instructions.

## Status

**Step 5 — Live web research wired (Tavily)**

Also includes experimental dossier sections:

- Job Intelligence
- Buying Committee Map
- ROI / TCO Opportunity Model
- What We Still Need to Know
- Why Now Synthesis
- Expanded Prospecting Plan

Experimental analysis sections may still include SAMPLE / MOCK content until later AI analysis steps.

## Repository

https://github.com/madicroteau/Cursor-Prospecting
