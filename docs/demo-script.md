# Ghost Diary — short real-inference demo

Target length: 60–90 seconds. Use fictional text. This is a recording script, not a claim that a video has already been captured.

1. **0–10s:** Show the local URL and the connected Gemma status. Say: “This is Ghost Diary. I write the diary. A local model writes something I didn't.”
2. **10–25s:** Write and save a short fictional entry containing a distinctive object, such as a yellow umbrella, and an ordinary routine.
3. **25–40s:** Press “Pass the night.” Show the actual generation wait; if editing the video, label any removed wait. Do not replace a failed generation with a fake output.
4. **40–55s:** Read the real ghost line. Open “See what changed” and point to the untouched original and red ghost ink. Restore the original.
5. **55–70s:** Show the editable prompt and model setting in `server/ollama.ts`. Say: “The model and diary run on my computer. I can change its instructions and choose another compatible local model.”
6. **70–90s:** Show the public recorded-demo label and the GitHub setup instructions. Explain that the site replays real fictional examples, while personal entries and fresh inference live locally.

Only include an offline claim after an actual fresh generation with the internet disconnected. Do not disconnect the user's network automatically. No screen-recording utility was found during setup; screenshots and the deployed interactive demo can accompany the submission if no video is recorded.

DevRelay belongs in “My Agent Session”: it documents how Codex helped build this application. It is distinct from Gemma generating diary interventions.
