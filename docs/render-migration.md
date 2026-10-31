# Render migration

Status: prepared, not deployed. The current custom domain remains on Sites
until the Render deployment is verified. Do not describe Render as the live
host or enter its prize category until publication is confirmed.

Preparation verified on 2026-10-31: `render.yaml` passed the current official
Render Blueprint JSON Schema, and `npm run build:demo` passed with the same
`index-Blq2uZKr.js` bundle as the verified Sites release. Render account access
has not yet been connected; no Render service or DNS change is claimed.

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

## Access still required

Render account access is needed to create/inspect the service. The domain's
DNS-provider session is needed to perform the cutover. A prepared Blueprint
and a GitHub push do not prove that deployment or domain migration occurred.
