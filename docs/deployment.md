# Publication status

## Latest deployment — version 4, 2026-10-31

Published successfully at **11:04:22 UTC / 12:04:22 Europe/Berlin** while preserving the existing public audience and domain bindings.

- Live domain: https://ghostinthemachine.tech
- GitHub application/video content: `2ff83576f7af59c76cbbd456315d7f468e194bc9`.
- Sites source: `a00a9d05d1289b6aa3fc8930b387982cf1228042`, a normal merge preserving both histories; its tracked file tree was verified identical to that GitHub commit.
- Saved version: `appgprj_6ae4b997b8808191b8a9827d4eb26129~appgver_71acb14e0c2c8191990f61f802618f64`.
- Deployment: `appgdep_6ae5cb291d1081918e9fe801f64a4863`, status `succeeded`.
- Archive SHA-256: `196f4472c1d50e441141b6f86d37ab07bb5a9361c531bedf6bd8901fa4b2fd6b`.

At 11:04:46 UTC, the custom domain returned HTTP 200. Its `/assets/index-Blq2uZKr.js` matched the freshly built recorded bundle exactly. Every manifest sentence matched its selected Gemma insertion, and all three served MP3s returned 200 with SHA-256 values matching the repository audio. This brings the current ElevenLabs narration to the hosted demo. See [release verification](release-verification.md) for hashes and limits. Final documentation-only changes do not alter this runtime build.

## Previous deployment — version 3, 2026-10-31

Sites version **3** was deployed successfully at **08:42:45 UTC / 09:42:45 Europe/Berlin** on the user's explicit request.

- Live custom domain: https://ghostinthemachine.tech
- Sites production URL: https://ghost-diary-ghostinthemachine.rarebloom15.chatgpt.site
- Approved GitHub content commit: `ab97d3cacaf6c07d39be83c41bc62246692ffa87`.
- Sites source commit: `2d44d6e67ad51f3a8a411a099f32d8ccff39cf06`; a history-reconciliation merge whose complete file tree was verified identical to the approved GitHub commit. Neither remote history was force-pushed.
- Saved version: `appgprj_6ae4b997b8808191b8a9827d4eb26129~appgver_18f8dbf10c708191bdd6eb4fd7bddef0`.
- Deployment: `appgdep_6ae5a9f8864c8191a6fde256ff501dc0`, status `succeeded`.
- Artifact SHA-256: `8a20bc4ee2d5bb6283928de663ac37c048323beda034971d464ee093f2bbdb0a`.

Built in an isolated checkout with `npm run build:demo`. Public access and existing domain bindings were preserved. A fresh HTTP check on the custom domain returned 200 and `/assets/index-DnSvw4Qn.js`; that served bundle contains all three exact selected Gemma interventions. The new sentences have no matching old narration, so their audio controls stay hidden. Browser interaction was not repeated during this deploy. Concurrent ElevenLabs work in the main workspace was excluded.

## Earlier deployment and domain setup

- GitHub source: https://github.com/style96/ghost-diary
- Sites project: appgprj_6ae4b997b8808191b8a9827d4eb26129
- Verified deployed, public Sites URL: https://ghost-diary-ghostinthemachine.rarebloom15.chatgpt.site
- Custom domain requested by user: ghostinthemachine.tech, obtained through the Hacktoberfest promotion.

Deployment succeeded on 2026-10-30. Version: appgprj_6ae4b997b8808191b8a9827d4eb26129~appgver_04f2cde910ec81919f79f12f7d89a3ec. Source commit: 756e8f630b7b838b4c9101b7f2e90de067ddb171. Access was explicitly set public for the approved public demonstration.

## Custom domain — active

Domain binding ID: appgdom_6ae4bd7ffbb48191b0ba170ef26a5cd6. Verified status: active; provider: active; TLS: active. https://ghostinthemachine.tech returned HTTP 200 with the Ghost Diary HTML on 2026-10-30. Authoritative nameservers: ns1.dns.host through ns4.dns.host. All four records below were added through the user's authenticated Namify panel and verified by querying ns1.dns.host. There were no pre-existing A records to replace. Other domain settings and unrelated records were retained.

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 162.159.143.30 |
| A | @ | 172.66.3.26 |
| TXT | _openai-site-verification | openai-site-verification=FY7qfLnabbq669gzLf7UONtB0RBej0ug67q3obSPZ88 |
| TXT | _cf-custom-hostname | 794867a4-045a-4b7f-a8c5-d8951deee4b4 |

These are public DNS validation values, not credentials. The apex uses the two A records; do not also add an apex CNAME. Routing and TLS activation are verified. Both TXT records are retained; the provider now reports only the OpenAI record as a required validation record.
