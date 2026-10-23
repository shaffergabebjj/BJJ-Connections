# BJJ Connections AI deployment and streaming

The main website is hosted on GitHub Pages. The chatbot backend is the Cloudflare Worker **bjj-connections**, with public endpoint `https://ai.bjjconnectionsbygabe.com/chat`.

## Production build configuration

In Cloudflare → Workers & Pages → **bjj-connections** → Settings → Build, use:

- Repository: `shaffergabebjj/BJJ-Connections`
- **Production branch: `main`** (not the original `feature/cloudflare-bjj-ai-chat` branch)
- Root directory: `worker`
- Build command: `npm test`
- Deploy command: `npm run deploy`
- Default dependency installation enabled.

The production branch is a dashboard setting, not a Wrangler setting. It must be checked in the authenticated dashboard; changing this README does not change Cloudflare. After merging, trigger/retry a production build if it did not start automatically. Confirm the deployed commit matches `main`.

Keep the account on Workers Free. Do not upgrade, add AI credits, or paste credentials into source code. The checked-in configuration supplies AI and both rate-limiter bindings. Preserve the existing custom-domain route when deploying. No billing or binding changes are needed for streaming.

## Response protocol and performance

The frontend sends `{ "question": "…", "stream": true }`. The Worker requests streaming directly from Workers AI and relays normalized Server-Sent Events with `Content-Type: text/event-stream` and `Cache-Control: no-store, no-transform`:

```text
data: {"response":"A guard "}

data: {"response":"uses your legs…"}

data: [DONE]

```

Only answer text, a safe error, and the completion marker are forwarded. Provider metadata and raw error diagnostics are discarded. Split UTF-8 and event boundaries are handled. EOF without `[DONE]` is an interruption, not success. A downstream cancellation cancels the upstream reader, but cannot guarantee GPU inference immediately stops.

Requests without `stream: true` retain the JSON `{ "reply": "…" }` response for cached older clients. The updated frontend also accepts the previous JSON Worker during rollout. There is one inference call per question, no automatic retries, no extra retrieval calls, and no chat-history transmission.

The browser waits up to **60 seconds without answer text**, resetting the deadline when text arrives. Streaming can therefore run longer than 60 seconds while making progress. Headers and heartbeats do not indefinitely extend the timeout. Stop, dialog close/Escape and offline events cancel the request. Interruptions preserve partial text with an incomplete-answer label. Screen-reader announcements are held while answer text updates; the separate status indicates waiting/generating. Text is never interpreted as HTML.

The system prompt targets about **200 tokens**, with a **256-token cap** (previously 350) to leave room to finish. We retain `@cf/meta/llama-3.1-8b-instruct-fp8`, already a quantized 8B model. Llama 3.2 3B is a possible smaller alternative, but parameter count does not establish actual Cloudflare latency or BJJ accuracy. Do not switch without testing both speed and representative answers. Streaming improves time to visible text; it does not eliminate provider queueing or cold-start latency.

Two pre-change production samples on October 23, 2026 returned JSON in **17.1576s** (guard) and **14.7132s** (sweep/reversal). First byte and completion were effectively identical. This small sample is not a percentile benchmark or an isolated measurement of GPU inference. Some model definitions were inaccurate, so this remains general learning assistance requiring the existing coach/rules notice. No alternative-model benchmark has been performed.

## Verification

```sh
# From repository root:
node --test worker/test/*.test.js tests/bjj-ai.test.cjs
# All main-site and Medal Run commands are in .github/workflows/validate.yml.
cd worker
npm ci
npm run check
npm test
```

The tests mock inference and rate bindings and consume no AI allowance. The dry run validates the bundle/config, not live inference. For an authenticated CLI deployment, use `npm run deploy`; otherwise use the connected Cloudflare build. Never put a token in the repository.

After deploying, run a single real inference benchmark from the repository root:

```sh
node worker/scripts/benchmark.mjs
```

It reports response headers, first answer text and completion times, plus whether SSE and its completion marker actually arrived. Run sparingly and respect 429/Retry-After. Check that `streaming` and `completed` are both true; JSON success alone does not verify the updated Worker.

On the live website, verify progressive text, Stop, close/Escape and focus return, partial-answer recovery, offline feedback, desktop and mobile layouts, light/dark themes and existing puzzle/game controls. Confirm the new `bjj-ai.js` is served; the service-worker cache version was bumped for the update.

## Preserved protections and limitations

- Exact origin allowlist: `https://bjjconnectionsbygabe.com` and `https://www.bjjconnectionsbygabe.com`.
- Trusted `CF-Connecting-IP` only; no `X-Forwarded-For` fallback.
- 5 requests/minute/IP and 30 requests/minute/service, **per Cloudflare location**. These native limits are approximate, not an exact global budget.
- Missing or failing limiters fail closed. Kill switch `CHAT_ENABLED: "false"` disables inference.
- JSON-only requests; body maximum 8 KiB and question maximum 1,000 characters. Clients cannot supply model/system/token settings.
- Origin checks limit browsers, not spoofed non-browser clients. Do not weaken limits to solve latency.
- Workers Free has a daily allowance; exhaustion can return 503. Existing rate limits do not guarantee zero spend on an already-paid account. This change does not change plans or billing.
- Privacy disclosure preserved. No app chat history or question/IP logging. Cloudflare platform processing policies still apply.

Official references checked October 23, 2026:
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/
- https://developers.cloudflare.com/workers-ai/models/llama-3.2-3b-instruct/
- https://developers.cloudflare.com/workers/runtime-apis/streams/
