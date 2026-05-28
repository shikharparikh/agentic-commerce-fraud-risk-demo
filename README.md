# Agentic Commerce Fraud Risk Demo

A clean localhost demo for explaining an end-to-end fraud risk framework for agentic commerce and autonomous payments. The app is intentionally deterministic, lightweight, and interview friendly.

## What It Demonstrates

The homepage centers on this lifecycle:

`User -> Agent Registration -> Delegated Permissions -> Intent Capture -> Transaction Request -> Risk Engine -> Decision Layer -> Monitoring Loop -> KPI/KRI Dashboard`

The demo emphasizes trust orchestration across human identity, agent identity, delegated authority, intent validation, transaction context, adaptive controls, and explainable decisions.

## Run Locally: Zero-Install Demo

```bash
node server.mjs
```

Then open:

```text
http://localhost:3000
```

This serves the primary `standalone/` demo. It uses browser ESM imports for React and React Flow, so there is no database, backend API, authentication system, payment processing, or external AI call.

If your shell does not have `node` on the path in Codex, this command works in the current desktop runtime:

```bash
/Users/shikharparikh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node server.mjs
```

## Publish On GitHub Pages

The `docs/` folder is a GitHub Pages-ready static build of the demo.

1. Create a new GitHub repo.
2. Push this project to the repo.
3. In GitHub, go to `Settings -> Pages`.
4. Set source to `Deploy from a branch`.
5. Choose branch `main` and folder `/docs`.
6. Save. GitHub will publish the site at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

The static Pages build uses only browser ESM imports, React, and React Flow. No server or database is required.

## Optional Next.js Version

The repo also includes a Next.js/Tailwind implementation in `app/` as an optional scaffold. On a machine with npm available:

```bash
npm install
npm run dev
```

## Project Structure

```text
app/
  globals.css        Global Tailwind and React Flow styles
  layout.tsx         Next.js app shell and metadata
  page.tsx           Main interactive demo UI
data/
  mockData.ts        Flow nodes, scenarios, KPI/KRI metrics, narration notes
  types.ts           Shared TypeScript types
standalone/
  index.html         Zero-install localhost entrypoint
  app.mjs            Browser React + React Flow implementation
  styles.css         Minimal executive-friendly visual system
docs/
  index.html         GitHub Pages entrypoint
  app.mjs            GitHub Pages static app bundle
  styles.css         GitHub Pages styles
server.mjs           Tiny static localhost server
README.md           Setup, component notes, and walkthrough script
```

## Component Notes

- `Scenario Simulator`: Three predefined deterministic cases. Selecting a case reruns the staged lifecycle evaluation.
- `Trust Lifecycle Flow`: React Flow diagram showing the evidence path from registration through monitoring and feedback.
- `Decision Engine`: Displays risk score, signal stack, transaction packet, control response, reason codes, triggered KRIs, authentication outcome, and friction level.
- `KPI / KRI Dashboard`: Lightweight static metrics for fraud loss, approvals, false positives, transaction success, override rate, agent drift, velocity, token, permission, and intent signals.
- `Narration Notes`: Concise presenter prompts for why agentic commerce changes fraud risk and how controls balance trust and customer experience.

## Demo Walkthrough Script

1. Start with the flowchart: "This is the trust lifecycle for an agentic commerce transaction. The system starts with user and agent identity, narrows delegated authority, validates purchase intent, then decides how much friction is justified."

2. Run Scenario 1: "Here the agent is registered, the merchant is familiar, spend is normal, and device context is consistent. The system approves with low friction because the behavior fits the delegated trust envelope."

3. Run Scenario 2: "This is not an automatic decline. A new merchant, higher amount, and unusual timing create uncertainty, so the system uses selective step-up authentication to validate intent before authorization."

4. Run Scenario 3: "This case shows delegated authority abuse signals: permission escalation, token inconsistency, velocity anomaly, and intent mismatch. The system declines and routes the event into monitoring."

5. Close with KPIs/KRIs: "The dashboard keeps the strategy balanced. KPIs show customer and fraud outcomes, while KRIs show early warning signals that controls may need adjustment."

## Design Principle

This is not a production fraud engine. It is a coherent strategy artifact that shows how agentic commerce fraud risk can be explained through registration, delegation, intent validation, adaptive controls, monitoring, and measurable tradeoffs.
