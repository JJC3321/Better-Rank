# Better Rank

Analyze and optimize brand visibility in LLM responses. Better Rank helps you understand how often your brand (BetterHelp) appears compared to competitors when users ask AI assistants for recommendations, and provides actionable optimization suggestions.

## What It Does

1. **Prompt Execution** – Runs a user-defined prompt multiple times (1–20x) through Gemini Flash 2.5 and records each response.
2. **Brand Mention Analysis** – Counts how often BetterHelp and a chosen competitor (e.g., Talkspace, Cerebral) are mentioned across all responses.
3. **Website Analysis** – Uses Tavily to analyze BetterHelp and competitor sites for strengths, weaknesses, keywords, and content structure.
4. **Optimization Recommendations** – Uses Gemini to generate recommendations across:
   - Content
   - Site structure
   - Keywords
   - SEO
   - LLM visibility
   - Competitive positioning
   - Action plans

## Tech Stack

- **Next.js** – App framework
- **Gemini Flash 2.5** – LLM for prompt execution and optimization
- **Braintrust** – Monitoring and tracing of LLM calls
- **Tavily** – Web search and website analysis

## Environment Variables

- `GEMINI_API_KEY` – Google AI API key for Gemini
- `TAVILY_API_KEY` – Tavily API key for website analysis
- Braintrust keys (if using Braintrust monitoring)

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set the required environment variables in `.env.local`.

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a prompt (e.g., “What are the best online therapy platforms?”).
2. Set execution frequency (1–20 runs).
3. Enter a competitor name to compare against BetterHelp.
4. Click **Start Analysis**.
5. Review brand mention stats, website analysis, and optimization recommendations.

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below.

[Continue working on v0](https://v0.app/chat/projects/prj_fBxDyazy2JEQkJS9nEFFu4wWE9ys)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [v0 Documentation](https://v0.app/docs)
