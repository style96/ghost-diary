# Ghost Diary demo video production

Spec: docs/video-demo-storyboard.md. User selected English, approximately 90 seconds.
Deliver an actual local-app capture, edited MP4 with ElevenLabs narration, captions, poster, and reusable source. No soundtrack. Preserve user's personal diary and application code.

- [x] Set up isolated Remotion project under artifacts/ghost-diary-video; open Studio.
- [x] Create a clean local recording context with fictional history and a fresh entry.
- [x] Capture genuine writing, saving, Gemma generation, local Windows speech, comparison and restore via browser controls. Preserve raw frames and action timings. Never claim authored output as live generation.
- [x] Generate one clearly illustrative hero image and factual diagram graphics.
- [x] Adapt final narration to the observed model output; generate voiceover with ElevenLabs and aligned caption timings.
- [x] Compose approximately 90 seconds at 1920×1080, with readable UI close-ups, truthful shortened-wait labels, no soundtrack, and no overlapping voiceover/ghost speech.
- [x] Render representative frames, review layout, then export MP4 and SRT into deliverables/.
- [x] Verify duration, streams, audio/caption timing, real captured actions, privacy and final video playback before delivery.

Recording method: continuous browser viewport screenshots with wall-clock timestamps, encoded as actual captured UI footage. Use CUA for all browser interactions. Encode and edit locally. Label any accelerated wait; do not fabricate motion or model responses.

Completion evidence: see docs/video-demo-storyboard.md and deliverables/verification.json.
The final MP4 is 90 seconds, 1920×1080 H.264 / AAC, 24,250,546 bytes.
Seven visual checkpoints reviewed; caption pages shortened after visual QA.
Independent source review found no substantive factual, privacy or timing issues.
Full final-file decode passed, as did browser playback and seek-to-ghost checks.
Windows inline audio mixing failed in the renderer, so picture was rendered
without audio and mixed/muxed with FFmpeg; no change to scene timing or content.
Local preview server is bound to 127.0.0.1:3130 and left running for the user.
No user personal diary was edited, no application feature code was changed for
the film, and no external publication occurred.
