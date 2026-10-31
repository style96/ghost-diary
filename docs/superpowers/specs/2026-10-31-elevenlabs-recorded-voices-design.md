# ElevenLabs recorded ghost voices

Date: 2026-10-31 (Europe/Berlin)
Status: approved and implemented; three real ElevenLabs MP3s generated on 2026-10-31 after user confirmation, then replaced with the user-approved soft whisper delivery.

## Intent and scope

Replace the three outdated Windows speech recordings with ElevenLabs narration of the current fictional ghost insertions in `src/demo/recorded.json`. Restore matching demo playback through the existing player and exact-text manifest checks.

## Approaches

- Offline generation and bundled MP3 files: selected by the user. Fits the existing recorded demo, with no hosted speech request during playback.
- Live speech for personal diary entries: considered and deferred. Would require a runtime service and separate privacy behavior.

## Proposed implementation

- Add a Node/TypeScript generation command using the official ElevenLabs SDK and text-to-speech endpoint. The later user instruction to run onboarding and follow its output supersedes the initial dependency-free fetch proposal.
- Read `ELEVENLABS_API_KEY` and optional `ELEVENLABS_VOICE_ID` only in the local generation process; document `.env.local` setup. Default to the documented premade Sarah voice. Never use Vite-prefixed secrets or include credentials in generated metadata, logs, or browser code.
- Current approved model: `eleven_v4`; MP3 output `mp3_44100_128`, Sarah voice, `[whispers]` delivery, stability 0.5 and similarity boost 0.75. This supersedes the initial ordinary `eleven_multilingual_v2` delivery after listening feedback. Friendly soft ghost voice, no background sound, added echo or pitch processing. Reuse the approved first preview unchanged; generate the remaining two using identical settings. Keep manifest text plain. Do not create or clone a voice.
- Provide a dry run that lists the three exact sentences without an API request. Actual generation sends only these fictional insertions, not diary originals or personal data.
- Stage and validate all three audio responses before publishing new assets and updating `src/demo/voices.json`. Keep the existing manifest intact on API failures. Keep exact spoken-text matching so stale audio remains hidden after fixture changes.
- Update the playback attribution and audio documentation after successful generation. Until actual audio exists, describe the command as available and the recordings as pending.
- Preserve existing unrelated working-tree changes. No deployment or external article publishing is included.

## Verification

Verify dry-run behavior, missing credentials, failed API responses, successful manifest/audio generation with mocked requests, and stale-audio filtering. Run the existing tests, typecheck, and both builds after implementation. Check the three real generated clips before claiming voice generation is complete.

## Current prerequisites

User-requested CLI onboarding created an ignored `.env.local` and verified its key. The user confirmed real generation. The CLI smoke test returned HTTP 200, then `npm run record:voices` generated all three MP3s with Sarah and multilingual v2 and updated the manifest. No deployment is included.

## Reference

Official API contract checked on 2026-10-31: https://elevenlabs.io/docs/api-reference/text-to-speech/convert
