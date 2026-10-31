# Render migration

Status: Render deployed; custom-domain DNS cutover and direct HTTPS checks
completed on 2026-10-31. Primary URL: https://ghostinthemachine.tech.

## Verified Render publication — 2026-10-31

- URL: https://ghost-diary.onrender.com
- Service: `srv-dbitepg473hc73ajfnmg`.
- Deployment: `dep-dbitepo473hc73ajfo20`, dashboard status **Live**.
- Source: `db6ffe1ff4ce33fb40002a0f81444eea4e37bc23`, GitHub branch `main`.
- Render's Linux build used Node.js **24.22.2** and completed the configured
  install, test and recorded-build command successfully.
- At 11:57:35 UTC, the site returned HTTP 200. Its
  `/assets/index-Blq2uZKr.js` matched the local recorded build exactly. All
  three MP3s returned HTTP 200 with the exact source SHA-256 hashes recorded
  in [release verification](release-verification.md).
- Both `ghostinthemachine.tech` and `www.ghostinthemachine.tech` are verified
  in Render. All four authoritative DNS servers return apex A `216.24.57.1`.
  The `www` CNAME is `ghost-diary.onrender.com`.
- Direct HTTPS checks with `curl --resolve` and normal certificate validation
  returned apex HTTP 200 and www HTTP 301 to the apex. The apex response
  included Render's `rndr-id` header, proving the request reached the new host.
- At 12:39:02 UTC, direct Render downloads of the recorded JavaScript and
  three MP3s matched the local SHA-256 hashes exactly. The www HTTPS redirect
  passed at 12:39:35 UTC. The dashboard showed its certificate issued.
- Dashboard Auto-Deploy is **On Commit**. Each GitHub `main` push triggers
  the configured install/test/build pipeline.
- GitHub App access was explicitly approved for only `style96/ghost-diary`.

Preparation verified on 2026-10-31: `render.yaml` passed the current official
Render Blueprint JSON Schema, and `npm run build:demo` passed with the same
`index-Blq2uZKr.js` bundle as the verified Sites release. Account access was
subsequently established through the user's Chrome session. The static site
was configured in the dashboard with the same settings as `render.yaml`.

## Service

`render.yaml` defines a static site from `style96/ghost-diary`, branch `main`.
The build installs locked dependencies including build tools, runs the test
suite, then builds the recorded demo into `out/`. Node.js 24 is selected.
Only `out/` is published. No environment secrets, Ollama endpoint, live diary
server or ElevenLabs key are required on Render.

Official references: [Static Sites](https://render.com/docs/static-sites),
[Blueprint specification](https://render.com/docs/blueprint-spec),
[Node version](https://render.com/docs/node-version),
[Custom domains](https://render.com/docs/custom-domains).

## Cutover sequence

1. Check the connected Render workspace for an existing Ghost Diary service
   before creating one. Create or configure the static site from `render.yaml`.
2. Wait for a successful deployment from the expected GitHub commit. Retain
   the actual service ID, deployment ID and returned `onrender.com` URL.
3. At that URL, verify HTTP 200, exact JavaScript equality with the local
   recorded build, and exact SHA-256 equality for all three manifest MP3s.
   Verify recorded-demo labels and, when browser access permits, reveal,
   compare, restore and optional playback.
4. Add `ghostinthemachine.tech` to the verified Render service. Inspect the
   service's returned DNS instructions and the existing authoritative DNS
   records before making any changes. Render may also add `www` automatically.
5. Change only the records needed to route the apex and applicable `www` host
   to Render. Preserve nameservers, mail records and unrelated TXT records.
   Do not delete the existing Sites project or its production deployment.
6. Verify authoritative DNS, Render domain verification, TLS and HTTPS on
   the custom domain. Repeat the bundle/audio checks through that domain.
7. Update deployment notes, README, release verification and the post with
   actual Render provenance. Repackage the final GitHub release after cutover.

## Rollback

Before cutover, the verified Sites apex A records were `162.159.143.30` and
`172.66.3.26`; re-read live authoritative records before relying on this
snapshot. Keep Sites's validation TXT records and default production URL.
If the Render domain cannot serve the verified demo with valid HTTPS, restore
the pre-cutover routing values and verify the custom domain against Sites.
Do not remove the working fallback while DNS is propagating.

## Preserved fallback

The former Sites project, default production URL and both validation TXT
records remain in place. Only the two former apex A records were replaced
by Render's single A record, and the www CNAME was added. Nameservers and
other domain settings were not changed. Render access and DNS changes were
performed through the user's authenticated Chrome sessions.
