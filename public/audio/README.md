# Temporary recorded ghost voices

These three WAV files speak the **previous** fictional Gemma interventions,
as identified by `src/demo/voices.json`. The new history-callback text in
`src/demo/recorded.json` does not match them, so the app hides their playback
controls. The old assets and manifest are retained unchanged until regenerated.
They are temporary preview narration, not Gemma audio
and not ElevenLabs output.

Matching recorded pages can show **Hear the ghost** and **Stop the ghost** controls.
ElevenLabs-generated replacement voices are planned, not yet implemented.

![The recorded diary with the Hear the ghost control](../../docs/screenshots/recorded-haunting-voice.jpg)

Generated on Windows using Microsoft Zira Desktop (`System.Speech`), then
slowed, filtered and given quiet delayed layers using Python's standard library.
No online audio service, cloned real-person voice, or personal diary text was used.

Regenerate from the repository root on Windows with Python 3 installed:

```powershell
./scripts/generate-ghost-voices.ps1
```

The intermediate dry speech is written to ignored `artifacts/ghost-voice-source/`.
The final files are mono, 22,050 Hz, 16-bit PCM WAV, bundled for local playback.
Only an explicit click starts playback; it stops on restore, page changes, or
leaving the diary view. The public demo still performs no live inference.

To use ElevenLabs later, replace these files with recordings of the same sentences
or update paths and spoken text in `src/demo/voices.json`. The manifest prevents
outdated audio from playing if demo text is regenerated. Recheck provider terms and attribution for
the final voices. Live cloud speech for arbitrary personal entries is outside this
feature and must be separately disclosed if added.
