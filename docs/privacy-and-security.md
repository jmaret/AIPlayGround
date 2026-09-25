# Privacy and security

Playground is a local learning tool. It is not a product that stores people.

## What we never do

- Accounts, sign-in, or email capture
- Analytics, pixels, or third-party scripts
- Writing prompts, answers, or uploads to disk
- Logging request bodies or chunk text
- Sending prompts to a cloud LLM in v1 (lab AWS diagrams are static maps, not API calls)

Chroma and LangSmith telemetry are turned off in the API process before those libraries import.

## What happens to what you type

Questions exist only in the current HTTP request and in short-lived process memory. Restarting the API wipes everything. There is no `localStorage` of prompts.

## Bind and CORS

Servers bind to `127.0.0.1`. CORS allows only `http://127.0.0.1:3010` and `http://localhost:3010`. The web app uses 3010 so it does not collide with other local apps on 3000.

## Headers (web)

- `Content-Security-Policy` — self + local API only
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `X-Frame-Options: DENY`

## Uploads

v1 labs do not accept user document uploads. If a later lab adds them: PDF/TXT, 1 MB cap, parse in memory, never write under `data/`.
