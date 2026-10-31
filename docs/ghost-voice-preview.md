# Ghost voice and ink preview

The ghost voice and ink features were merged from `codex/ghost-voice-ink`
into `main` and published at [ghostinthemachine.tech](https://ghostinthemachine.tech).
The commands below run a local preview of that recorded experience.

```sh
npm install
npm run dev:demo
```

Open http://127.0.0.1:4174. Select **Pass the night** to reveal the ghost's ink.
The new words appear over about 1.2 seconds. Select **Hear the ghost** to play
that sentence; select **Stop the ghost** to stop and rewind it. Restoring the
page, switching pages, or opening **How it haunts** also stops playback.

The active three MP3 voices were generated offline with ElevenLabs (Sarah,
`eleven_v4`, soft whisper delivery) on 2026-10-31 and match the current ghost insertions.
There is no background soundtrack, added echo or pitch processing.
Regenerate through `npm run record:voices`. Historical Windows WAV files are
retained but no longer referenced. No live speech generation is included.
No audio autoplays, and no
private diary text is sent to an external service. The local Windows application
uses the normal Windows speech voice without added effects on demand for current ghost insertions,
and shows the ink animation on new hauntings. It does not use demo voices for
personal entries. Installed Windows desktop speech is required.
Reduced-motion preferences show ink immediately.

Audio source and regeneration instructions: `public/audio/README.md`.
To replace the voice, follow the ElevenLabs setup in `public/audio/README.md`;
the command writes MP3 files and updates `src/demo/voices.json` together.
Keep manifest text equal to the spoken sentence; stale recordings are hidden
when the current demo text no longer matches.

Validation: fixture matching and pending playback lifecycle tests; both builds;
desktop and 390px mobile browser checks; real WAV playback and restore/page
navigation checks. Automated test results and commit details are reported with
the delivery rather than assumed by this document.
