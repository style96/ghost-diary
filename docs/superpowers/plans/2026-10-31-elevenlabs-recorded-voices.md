# ElevenLabs Recorded Voices Implementation Plan

> **For agentic workers:** Execute inline using superpowers:executing-plans, with test-driven-development and verification-before-completion.

**Goal:** Generate three bundled MP3 clips for the current fictional demo insertions.
**Architecture:** A Node-only script loads the local environment and calls the official SDK. Complete, validated audio is published under content-based names before replacing the manifest, so failed requests never change current playback.
**Tech Stack:** TypeScript, Node 24, tsx, Vitest, @elevenlabs/elevenlabs-js.
**Spec:** ../specs/2026-10-31-elevenlabs-recorded-voices-design.md

## Global Constraints

- No personal diary text, runtime browser API calls, credentials in browser code, or deployment.
- Preserve existing working-tree changes; use branch codex/elevenlabs-recorded-voices in the existing project folder.
- Ruling: the user's later instruction to run ElevenLabs onboarding and follow its output supersedes the proposed dependency-free fetch implementation; use the official SDK and `.env.local`.
- Keep proposed multilingual v2 model and MP3 44.1kHz 128kbps. Default to the documented soft Sarah voice; allow an environment override.
- Speech-generation tests against the real service require the onboarding test confirmation. Mock tests and dry runs spend no credits.

## Review Focus

Missing credentials must fail before network access. Invalid IDs must not traverse paths. Partial or invalid audio must not publish a manifest. Failed subsequent requests must preserve old assets and manifest. Importing the script must do no work.

## Task 1: Generation command

Files: scripts/record-elevenlabs.ts, tests/elevenlabs-voices.test.ts, package.json, .env.example.
Interface: `recordVoices({root, env, dryRun, convert?})` returns the planned manifest; the injectable converter returns a web audio stream.

- [x] Add tests for dry-run isolation, missing credentials, exact fictional text, success, provider failure, malformed audio, and unsafe fixture IDs.
- [x] Run focused tests and observe failure before implementing.
- [x] Implement local environment loading, SDK adapter, bounded audio validation, generation-specific assets with content hashes and manifest replacement.
- [x] Run focused tests and dry run; missing-key behavior verified by unit test.

## Task 2: Attribution and verification

Files: src/demo/voices.ts, src/components/GhostVoice.tsx, public/audio/README.md, docs/ghost-voice-preview.md, README.md.

- [x] Preserve stale-text filtering and show provider attribution only for an ElevenLabs manifest entry.
- [x] Document setup, generation, dry run and pending real audio status.
- [x] Run all tests, typecheck, both builds, diff checks and ElevenLabs onboarding check.
- [x] Review changes and report actual generated-audio status, without claiming mocked recordings are real.

## Progress

Design approved by the user. Onboarding connected and `.env.local` is gitignored. Official text-to-speech skill and referenced guides read from the temporary download. Existing unrelated changes remain in place. No real speech request made yet.

Verification: 130 tests passed across 20 files, including six new mocked generation tests; standalone typecheck passed; local and recorded builds passed. Dry run printed exactly the current three sentences. Diff whitespace check passed after normalizing edited Markdown line endings. Independent read-only review found no substantive correctness or security issues. CLI onboarding confirms a working key, declared/imported SDK and recognized environment loading, and now offers a real test request. Waiting for user confirmation before any real speech request; bundled WAV recordings and manifest remain unchanged. No commit, push or deployment performed.

### Real generation, 2026-10-31

User confirmed generation of all three clips. CLI onboarding test returned HTTP 200.
`npm run record:voices` succeeded with Sarah (`EXAVITQu4vr4xnSDxMaL`),
`eleven_multilingual_v2`, MP3 44.1kHz/128kbps. All three MP3s and the updated
manifest are in the project; historical WAVs remain unchanged. Updated the
previous stale-audio-only regression to validate exact current narration,
asset hashes and rejection of changed interventions. All 130 tests and both
builds passed again after real generation. No deployment performed.

Browser verification at `http://127.0.0.1:4174`: all three revealed pages show
the ElevenLabs attribution and narration control. Each MP3 reached media
readyState 4 with `paused=false` and no media error after clicking playback.
Durations: 1.950476s, 2.414875s, 2.229116s. File sizes: 32,225, 39,749,
36,823 bytes. These checks verify decoding/playback, not subjective voice quality.

### Approved whisper revision, 2026-10-31

The user rejected the ordinary Sarah delivery and a processed horror/ambient
sketch, removed background sound from scope, and approved the direct soft whisper
preview. Current direction: friendly, gentle ghost; no soundtrack, added echo or
pitch processing. Generate using Sarah, `eleven_v4`, `[whispers]`, stability 0.5,
similarity boost 0.75, MP3 44.1kHz/128kbps. Keep delivery tags out of manifest text.

Updated the generator defaults and added explicit `--reuse-preview` validation.
The approved first clip was copied byte-for-byte; only the other two required
new API generations. Batch `455aaf26-e299-4cc1-8cfc-000e6a032f51` is now active.
Decoded durations are 2.720s, 2.960s, 2.720s. All 131 tests, typecheck, both builds,
and diff whitespace checks passed. Independent read-only review found no
substantive new issues. Browser playback of the new first asset succeeded with
no media error, duration 2.72s, and `paused=false`. The local demo was opened for
the user. No deployment or new generic CLI smoke-test generation was necessary.
