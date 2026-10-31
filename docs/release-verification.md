# Ghost Diary — final release verification

Verified on 2026-10-31. Release scope: existing application, recorded demo, voice assets, video and submission materials; no new application feature was added during closure.

## Source and publication

- GitHub `main` and the local application/video source matched `2ff83576f7af59c76cbbd456315d7f468e194bc9` before final documentation corrections.
- Sites version **4** deployed successfully and remains a fallback. Source `a00a9d05d1289b6aa3fc8930b387982cf1228042` preserves Sites/GitHub history and has the same tracked file tree as that application commit.
- The primary domain subsequently migrated to Render. Both apex and www DNS names are verified. Direct HTTPS requests to Render IP `216.24.57.1` passed certificate validation; apex returned 200 and www redirected to the apex with 301. The served JavaScript and all three MP3s matched local hashes. See [Render migration](render-migration.md) for service, deployment and DNS provenance.
- Final documentation corrections update examples, timing, voice attribution and publication status; runtime code/assets remain unchanged.
- https://ghostinthemachine.tech returned HTTP 200. Its `/assets/index-Blq2uZKr.js` matched the verified `out/` bundle exactly.

The three manifest sentences match the three selected Gemma insertions exactly. Served MP3s returned HTTP 200 and matched repository hashes:

| Page | Audio SHA-256 |
| --- | --- |
| The yellow umbrella | `9030069ab1f0985af57f2bd0ff09d2c58fc58fd63f499694c1ebccd86249bfd8` |
| The empty hook | `542ccb74cabbc02cace487879e5613b760dd23b78935c6576256dc4918f64e72` |
| The locked cupboard | `761aef82696c810c0e3b28de1bedb648af902f236af16258bec74af8791dce48` |

## Fresh validation

- `npm test`: **135 passed**, 21 files.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run build:demo`: passed.
- Builds produced only the existing non-failing Zod annotation warnings.
- Full MP4 decode with FFmpeg: passed, exit 0 and no decoding errors.
- MP4 SHA-256: `269292ad695571e1f1c7974421be07cb25031316337d0640e1f2b01e3d2575a9`, matching `deliverables/verification.json`.

## Story and audio alignment

The website replays three curated local Gemma generations. Its Sarah whisper clips were generated through ElevenLabs during preparation and are bundled for playback. The local Windows app generates new speech on the device. The video shows a separate genuine local generation, “I traced the bent spoke with my finger,” and uses actual Windows app speech plus separate ElevenLabs explanatory narration. The differing sentences are separate genuine runs, not stale or mismatched fixtures. The delivered 90-second video includes English captions and labels its shortened inference wait.

Earlier screenshots remain historical and are identified as such in the README. The submission draft uses the video's illustrated title card, clearly labeled as illustration, instead of presenting old fixture screenshots as current.

## Limits and handoff

Interactive browser verification could not be repeated: Computer Use stopped because it could not determine the browser URL confidently enough. HTTP/file equality checks and automated tests passed; this release check does not claim a fresh manual playback or mobile interaction test. The earlier disconnected-network result remains author-reported.

The current English post is [submission.md](submission.md). Its examples, measured timings, video link, model/audio roles and prize-category descriptions match the release. Updating the existing DEV draft was rejected by automatic approval policy (`requires approval, but approval policy is never`), so the remote draft remains unchanged. No article was published and no session was shared during this closure. Review/copy the local text into the existing DEV draft before publication.
