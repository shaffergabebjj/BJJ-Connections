# Ask BJJ backend

The static `ask.html` page calls this Cloudflare Worker. It keeps the OpenAI API key off the public website and limits each question to 500 characters, the response to 350 output tokens, and requests to five per minute per network address per Cloudflare location. The limit is an abuse guard, **not** a guaranteed spending cap.

## Deploy

1. Use a Cloudflare account with the `bjjconnectionsbygabe.com` zone active. The Worker config reserves `chat.bjjconnectionsbygabe.com` as a Custom Domain; this hostname must not already have a DNS record.
2. Create an OpenAI API project, buy a small prepaid credit amount, turn off automatic recharge if you do not want repeat purchases, and set a project monthly **hard spend limit** (not just a budget alert). API billing is separate from a ChatGPT subscription. Create a project API key and keep it private.
3. In Cloudflare **Workers & Pages → Create application → Import a repository**, connect `shaffergabebjj/BJJ-Connections`. Name the Worker `bjj-connections-chat`, set its **root directory** to `worker`, and deploy from `main` after this PR is merged. Check **Settings → Domains & Routes** for `chat.bjjconnectionsbygabe.com`.
4. In the Worker's **Settings → Variables and Secrets**, add a **secret** named `OPENAI_API_KEY` with the key value. Never put it in GitHub, `wrangler.jsonc`, or `chat.js`.
5. Open `https://bjjconnectionsbygabe.com/ask.html` and ask a test BJJ question. Check the browser network panel for a POST to `https://chat.bjjconnectionsbygabe.com/chat` that returns an answer.

The Worker accepts browser requests from the main domain and `www` only. Its rate limit is local to each Cloudflare location and can affect people sharing an IP address. Watch OpenAI project usage and adjust the budget or limit if needed. The chat keeps the current conversation in browser memory only; reloading the page clears it. Responses are not stored by this application (`store: false` is sent to the API).

For a terminal deployment instead, run `npx wrangler login`, `npx wrangler deploy`, and `npx wrangler secret put OPENAI_API_KEY` from the `worker` directory (Wrangler 4.36.0 or later).

Run the local Worker checks with `node tests/chat-worker-test.mjs` from the repository root. They mock the AI response and do not call the API.
