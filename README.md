# Account Intel

AI-powered enterprise account research for sales teams.

The application answers one question:

**What do I need to know before prospecting into this account?**

It turns public information into actionable account intelligence for a Cursor sales conversation. AdventHealth is the primary demo account.

## How to run

```bash
npm install
npm run dev
```

Open the URL printed by `npm run dev`:

- [http://localhost:3000](http://localhost:3000) in most cases
- [http://localhost:3001](http://localhost:3001) if port 3000 is already taken

The home form is pre-filled with AdventHealth. Click **Research Account**.

## Enable live research

Create `.env.local` from `.env.example`:

```bash
TAVILY_API_KEY=your_tavily_api_key_here
```

Optional — named buying-committee leaders:

```bash
APOLLO_API_KEY=your_apollo_api_key_here
```

Restart `npm run dev` after adding keys.

OpenAI is not required. Insights are built from organized public sources using local analysis.

## Recommended AdventHealth click-through

1. **Overview** — fastest way to understand the account: brief, Why Now, initiatives, technology, people, and the first sales angle.
2. **Buying Committee** — publicly identifiable technology leaders, with buying roles labeled as inferred.
3. **Technology** — Cursor-relevant stack signals with evidence, source, and confidence. Mentions are facts; environment conclusions are inferences.
4. **Job Intelligence** — technical hiring analyzed for sales signals: top technologies, hiring themes, then FACT / INFERENCE / SALES HYPOTHESIS.
5. **Initiatives** — public strategic themes with technology implications. Cursor relevance only when the evidence supports it.
6. **Why Now** — strongest evidence-backed timing triggers synthesized from the other pages.
7. **Prospecting Plan** — who to contact first, why, conversation angles, discovery questions, and remaining gaps.
8. **Sources** — clickable evidence library grouped by company, people, jobs, technology, initiatives, news, financial/public, and regulatory.

## What may not populate

The app does **not** invent people, titles, technologies, jobs, or initiatives.

| Source | What it fills | If unavailable |
| --- | --- | --- |
| Tavily (`TAVILY_API_KEY`) | Web research for all pages | Pages stay empty and say live research is unavailable |
| Apollo (`APOLLO_API_KEY`) | Named technology leaders on Buying Committee | People page shows unfilled roles instead of invented names |
| Careers / job boards via Tavily | Job Intelligence counts and extracted jobs | Job page stays empty rather than fabricating openings |
| First-party leadership pages | Named executives | Role shown as “no publicly identifiable person found” |

Financial figures, org charts, reporting relationships, and “this person is buying Cursor” claims are never invented.

## Repository

https://github.com/madicroteau/Cursor-Prospecting
