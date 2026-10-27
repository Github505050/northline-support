# Northline Supply — Customer Support Chatbot

A fictional, responsive retail experience with a functional customer-support chat widget. An independent portfolio project, **not** a paid client commission and **not** a real retail business.

## What works right now

- Responsive landing page, product collection, FAQs, mobile menu and sample shopping bag.
- Guided support chatbot with quick replies, typing animation, conversation history during the current page session, reset, natural-language intent matching, input validation and unsupported-question fallback.
- Product, shipping, returns, refund and support-hour answers from an editable knowledge module.
- Fictional order lookup: `NS-1042` (shipped), `NS-2085` (processing) and `NS-3140` (delivered). Answers explicitly say they are sample records.
- A public portfolio case-study page with real screenshots captured from an isolated Chromium interface test.
- An **optional** Cloudflare Worker implementing Gemini AI with server-side credentials, input checks, origin allowlist and per-IP approximate rate limiting. **It is not deployed or authenticated by default.**

The default assistant is a **deterministic FAQ demonstration, not AI**. The storefront cannot take payments, check real orders, send support tickets or connect to a human.

## Project structure

```text
docs/
  index.html               main storefront
  case-study.html          independent portfolio case study
  config.js                public backend URL (never an API key)
  assets/
    styles.css             design + responsive styles
    store.js               interactive website and chat UI
    chatbot.js             deterministic FAQ response logic
    knowledge.js           products, FAQs, policies and demo orders
    *.svg                  original, locally authored product artwork
    screenshots/           real isolated-browser screenshots
server/
  worker.js                optional AI API/backend
  wrangler.jsonc           Cloudflare deployment and rate limits
tests/
  chatbot.test.js          deterministic chatbot unit tests
  worker.test.js           server validation/security test doubles
  browser_check.py         isolated Chromium interface tests
```

## Run locally

1. Download or clone this repository.
2. From the project folder run: `python3 -m http.server 8000 -d docs`
3. Open `http://localhost:8000` in your browser. The guide-based chatbot works immediately, without dependencies, accounts or payment details.
4. Run Node tests: `npm test` (Node 20+ recommended).

**Note:** the `browser_check.py` test loads the actual HTML/CSS/JS into an isolated Chromium document because navigation is blocked in its original test environment. It is not a substitute for tests against the published public URL. It requires Playwright + Chromium installed. Browser testing against GitHub Pages is still needed after publishing.

## Deploy free static storefront on GitHub Pages

1. Create a **new public** GitHub repository named `northline-support` (keep it separate from other projects).
2. Push or upload this project's files, keeping the directory structure. Don't upload an archive file in place of extracted source.
3. Open repository **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, `main`, folder `/docs`, then Save.
4. After GitHub completes its publishing workflow, visit `https://github505050.github.io/northline-support/` and the `/case-study.html` page.
5. GitHub Pages publishing completed successfully on October 27, 2026. Still verify the links, images, chat and tablet/mobile layout on the public URL in a separate browser; the testing environment could not independently fetch the published site.

Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Optional: activate genuine AI safely

The frontend always displays **Guided demo** until the Cloudflare Worker is deployed and returns `{ "mode": "ai" }` from its health endpoint. A missing, blocked or failed backend automatically returns to the clearly labeled FAQ mode.

1. Create a Cloudflare account (Workers Free is enough for a small demonstration, subject to plan limits).
2. Generate a Gemini Developer API key in [Google AI Studio](https://aistudio.google.com/apikey). Check current model availability, free-tier quotas, data-handling terms and any billing settings in your account.
3. Install a supported Node.js version and run `npx wrangler login` on your own computer.
4. From the project root, run `npx wrangler deploy --config server/wrangler.jsonc`.
5. Run `npx wrangler secret put GEMINI_API_KEY --config server/wrangler.jsonc` and paste the key **at the secure interactive prompt**. Do not send it through chat, put it in GitHub, or write it into frontend files. This creates a new Worker deployment.
6. Copy the Worker URL, e.g. `https://northline-support-ai.<your-subdomain>.workers.dev`, into `docs/config.js` as the value of `window.NORTHLINE_API_URL` (without a trailing slash). The URL is public configuration; it is safe to commit.
7. Commit the updated `docs/config.js` and retest the GitHub Pages site. The live widget should display **AI powered**. Ask a supported question and an unknown question. If it says Guided demo, check `/health`, Wrangler logs, the origin setting, rate limit and credential configuration.

The example Cloudflare configuration only permits browser requests from `https://github505050.github.io`. If deploying elsewhere, change `ALLOWED_ORIGIN` in `server/wrangler.jsonc` to the **exact site origin**, then redeploy.

**Important controls:** The Worker uses Cloudflare Rate Limiting (8 requests per IP per 60 seconds, approximate per Cloudflare location), validates 400-character messages, limits supplied history to 8 messages and caps AI response length/output tokens. Origin allowlisting limits cross-origin browser use but is **not** authentication and can be spoofed by scripts. The Cloudflare rate limiter is not a global or financially guaranteed spending cap. Keep billing disabled for a free-tier-only project, monitor usage, and set provider quota/budget alerts before enabling a paid tier. Never ask users for real payment details or identifying order information. Gemini Free Tier usage may be used to improve Google's products; review Google's latest terms before processing real client data.

This demo does **not** have a secure customer authentication system or a real order API. Do not add actual orders to the public `knowledge.js` file. For a production chatbot, you would need authentication, a private order service, data retention/privacy requirements, abuse controls across regions and a real agent handoff integration.

## Customize for a future client

1. Edit `docs/assets/knowledge.js`: name, products, shipping/return/refund policies, FAQs and sample support options.
2. Rebrand typography, colors, spacing and imagery in `docs/assets/styles.css` and the HTML.
3. Change the product illustration assets or replace them with properly licensed photos.
4. Add the chat widget to the client's website. At present the widget markup, chat-only CSS and JavaScript are bundled within the storefront; refactor into an embeddable widget or framework component if the client requires drop-in installation.
5. For real orders, add a secure backend authentication flow and access-controlled store API, **never a public JSON file**.
6. For a live agent, integrate a staffed ticketing system or helpdesk provider; the current human escalation is informational only.

### Common problems

- Blank page: make sure the entire `docs/` folder and the JavaScript modules were uploaded, and run through a local web server rather than `file://`.
- Chat says Guided demo: expected without a deployed Worker or valid secret; check `docs/config.js` and Worker `/health` when enabling AI.
- Policy answer is outdated: edit `docs/assets/knowledge.js`, commit, redeploy and refresh.
- AI returns an error: examine API quota, valid key, `ALLOWED_ORIGIN` and Cloudflare Worker logs. UI will display the fallback.
- Styling broken on GitHub Pages: verify `assets/` paths and Pages source folder `/docs`.
- New product not showing: add its structured data in `knowledge.js` and the SVG/image in `docs/assets/`.

## Tests and verification

- **11 Node unit/security-focused tests passed** with `npm test`.
- **Isolated Chromium UI tests passed** at desktop 1440px, tablet 768px and mobile 390px widths for product cards, FAQs, menu, chat opening, fictional order response, unknown-question fallback, chat reset, cart interaction, case study, JavaScript console errors and horizontal overflow.
- A tablet overflow bug was discovered and fixed before retesting.
- Static code inspection: no embedded API credentials or external paid-image dependencies. Test-only generated images are the project's original vector assets.
- **Publishing completed:** The GitHub repository and GitHub Pages deployment workflow are live (workflow success recorded October 27, 2026). **Not done:** production Cloudflare AI setup, a live Gemini request with credentials, direct HTTP verification from this test environment or public-URL browser interaction tests.

## Portfolio / licensing notes

This code and all decorative product SVG artwork are original sample assets created for the demo. The brand, products, quotes, prices, policies and orders are fictional. There are no testimonials, purchase functionality, real customer data or claims of a commissioned client. Upwork portfolio materials may link to the published demo after opening the site and checking the public interactions; describe guided FAQ functionality honestly while AI is not connected.
