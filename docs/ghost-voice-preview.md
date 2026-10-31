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

The three voices are temporary locally synthesized recordings. No ElevenLabs
integration or live speech generation is included. No audio autoplays, and no
private diary text is sent to a service. The local live application also shows
the ink animation on new hauntings, but does not use demo voices for personal
entries. Reduced-motion preferences show ink immediately.

Audio source and regeneration instructions: `public/audio/README.md`.
To replace the voice later, update the WAV files and `src/demo/voices.json`.
Keep manifest text equal to the spoken sentence; stale recordings are hidden
when the current demo text no longer matches.

Validation: fixture matching and pending playback lifecycle tests; both builds;
desktop and 390px mobile browser checks; real WAV playback and restore/page
navigation checks. Automated test results and commit details are reported with
the delivery rather than assumed by this document.
