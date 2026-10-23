# BJJ Connections AI deployment

The draft PR contains the chat UI, page integration, Worker, and tests. The website button stays hidden while `bjj-ai-config.js` has an empty endpoint. Do not merge or enable it until a real AI response has been tested.

## Deploy from Cloudflare in your own browser

The existing Cloudflare GitHub comment identifies a Worker named **bjj-connections**. This configuration uses that exact name. This is the chatbot backend; the main website stays on GitHub Pages.

1. Open your Cloudflare dashboard → **Workers & Pages** → **bjj-connections** → **Settings → Build**. If it has not been created, create a Worker connected to `shaffergabebjj/BJJ-Connections` and name it `bjj-connections`.
2. Set the Git branch to `feature/cloudflare-bjj-ai-chat` for initial testing. Set **Root directory** to `worker`, **Build command** to `npm test`, and **Deploy command** to `npm run deploy`. Leave the default dependency installation enabled. Save and trigger a new build/retry.
3. Keep the account on **Workers Free**. Do not upgrade or add prepaid AI credits for this project. The checked-in configuration supplies the `AI`, `CHAT_RATE_LIMITER`, and `SERVICE_RATE_LIMITER` bindings automatically; no password or API token belongs in the source code.
4. Copy the deployed HTTPS **workers.dev URL** from the Worker overview. Open its `/health` path. `configured: true` means the bindings exist, **not** that AI inference succeeded. Share the public Worker URL so the integration can be tested and configured.

If the build still fails, share the non-secret build error. Common causes: wrong root directory (Wrangler config is inside `worker`), Worker name mismatch, or missing Workers AI permission on the Cloudflare-generated build token. Do not share tokens. If Cloudflare requests additional permissions, review them in your own account.

## Connect and verify before merging

1. Test a real request against the deployed Worker (replace the example host):

```sh
curl -i 'https://YOUR-WORKER.workers.dev/chat' \
  -H 'Origin: https://bjjconnectionsbygabe.com' \
  -H 'Content-Type: application/json' \
  --data '{"question":"What is guard retention in BJJ?"}'
```

The response must be HTTP 200 with a nonempty `reply`. `CF-Connecting-IP` is supplied by Cloudflare; do not add it to this command. A 503 can mean a missing binding, exhausted allowance, disabled chat, or an AI service error. A 429 means wait at least 60 seconds.

2. Put the deployed `/chat` URL into `endpoint` in root `bjj-ai-config.js`. Do not include a token or query string. Only `https://bjjconnectionsbygabe.com` and `https://www.bjjconnectionsbygabe.com` are allowed frontend origins.
3. Run tests below, then merge PR #63 once deployment is verified. In Cloudflare Build settings, switch the production Git branch back to `main` after merging. The public website receives the button through its normal GitHub Pages deployment.
4. Verify the actual website on desktop and mobile: open/close, Escape and focus return, send a BJJ question, verify rate-limit feedback, check offline feedback, light/dark themes, and existing puzzle/game controls. Browser layout and live-model behavior still need this deployed smoke test.

## Protections and limitations

- 5 requests per minute per IP and 30 per minute across the service **per Cloudflare location**. These native limits are approximate and are not an exact global daily budget. Use unused namespace IDs if `63001` or `63002` already belong to another limiter in the account.
- Missing/failed limiter bindings block inference rather than silently allowing requests.
- Request body maximum 8 KiB, question maximum 1,000 characters, response maximum 350 model tokens. Client requests time out after 25 seconds; cancellation does not guarantee server inference stops.
- Origin allowlisting limits browser access; it is not authentication. Non-browser clients can spoof Origin. For heavier abuse, add verified Turnstile protection before increasing traffic or enabling paid usage.
- Workers Free provides a daily AI allowance and refuses further inference when exhausted. On a paid account, these rate limits do **not** guarantee zero spend. No plan or billing changes are made by this repository.
- Set `CHAT_ENABLED` to `"false"` in `worker/wrangler.jsonc` and redeploy for an emergency backend stop. Clear `endpoint` to hide the frontend button.
- No chat history is sent or persisted by the app. Each question is independent. Questions go to Cloudflare inference; the app does not log questions or IPs. Cloudflare platform processing and logging policies still apply.
- This is general BJJ assistance, not live rules verification or retrieval of the full site. Model replies render as plain text.

## Local checks and CLI alternative

```sh
node --test worker/test/*.test.js tests/bjj-ai.test.cjs
cd worker
npm ci
npm run check
npx wrangler login
npm run deploy
```

Tests mock Cloudflare inference and rate bindings; they verify request handling and UI behavior without spending AI usage. `npm run check` validates the Worker bundle/config without deploying. Keep the committed lockfile for reproducible builds.

Official references (checked October 23, 2026):
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/
