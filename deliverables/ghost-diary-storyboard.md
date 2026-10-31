# Ghost Diary — demo video storyboard

Status: completed; 90-second English MP4 delivered locally on 2026-10-31.
Target: approximately 90 seconds, English narration and captions, 1920×1080 MP4.
Date: 2026-10-31, Europe/Berlin.

## Creative direction

A quiet, curious story about a friendly presence in a private notebook.
Warm paper, olive ink and the application's existing ghost illustration.
No horror treatment, jump scares, soundtrack or background ambience.
Clear, gentle ElevenLabs narration; preserve space to hear the app's own local
Windows ghost voice once. Narration and application speech must not overlap.

## Approach

Record the real local application and its genuine Gemma generation, then edit
that recording with short illustrated title cards, close-ups and captions.
This is the approach that fits the request to show the app working locally.
A wholly animated reconstruction would not demonstrate real behavior; a raw
uncut desktop recording would make the story harder to follow.

Use only a clean recording context containing fictional test pages. Do not
record the existing personal diary list, private text, keys, terminal history,
notifications, or unrelated windows. Keep original captures as evidence.
If inference waiting is shortened in the edit, label it “Wait shortened.”
Never replace a failed generation with an authored sentence presented as AI.

## Story: “Someone else was here”

| Time | Picture / real action | Narration |
| --- | --- | --- |
| 0–7s | Warm title card, friendly ghost, then the real local notebook. | “Most diaries have one author. This one sometimes has two.” |
| 7–22s | Show an earlier fictional entry mentioning a yellow umbrella with a bent spoke. Write and save a new page about an empty hook and an ordinary evening. | “This is Ghost Diary. I write about ordinary things: a yellow umbrella, a cup of tea, the end of a quiet day.” |
| 22–38s | Click Pass the night. Show the real busy state and completed Gemma response. Clearly mark any shortened wait. | “When I pass the night, Gemma reads this page and a little of its history. The model runs here, on my computer.” |
| 38–52s | Slow close-up of the actual generated line. Click Hear the ghost. Leave narration silent during the Windows-generated speech. | “And then, a sentence appears that I never wrote.” |
| 52–68s | Open See what changed, show original beside intervention, close it and restore the original. | “The original is still safe. I can compare both versions, see exactly what changed, and bring my own words back.” |
| 68–80s | Short animated diagram over a captured local-app frame: notebook → local server → Ollama + Gemma. | “Your notebook stays on your device. Local inference adds the trace. Local Windows speech gives that trace a voice.” |
| 80–90s | Return to the restored notebook; clean final title and repository URL. | “A private notebook. An uninvited author. Ghost Diary. Your words—until they're not.” |

The exact generated sentence and whether it recalls a historical detail will
be determined by the actual successful recording. Narration will be adjusted
to what the model truly produced, rather than forcing a scripted model output.

## Visual support

- The UI remains the primary visual; use restrained zooms to make diary text readable.
- Optional ImageGen artwork: one friendly, translucent little ghost near an open
  notebook, warm paper palette, no text. Label or use it clearly as illustration,
  never as a screenshot of the product.
- Render explanations and any data labels as crisp editable text, not generated
  image text. No invented usage numbers, performance claims or statistical charts.
- The currently verified 135 passing tests may be mentioned in production notes;
  they do not need to become an on-screen marketing statistic.

## Audio and captions

- ElevenLabs Sarah, clear gentle narration, normal delivery rather than whispering
  the entire voiceover. User already authorized ElevenLabs narration for this video.
- The app's ghost speech is the original Windows pipeline, captured or synchronized
  from the actual local audio output; identify it as local Windows speech.
- No soundtrack, ambience, added echo or pitch changes in the video mix.
- Legible English captions with timings aligned to the final narration audio.
- Final credits distinguish: diary text generation — Gemma; app speech — Windows;
  video narration — ElevenLabs; optional illustrative artwork — ImageGen.

## Production and verification

Remotion official skills installed: best practices, create, markup, render,
captions. Keep the video composition and media isolated from app dependencies.
Use the real browser surface for UI interactions and capture.
Verify the entire MP4 duration, frame dimensions, captions, voice timing,
audible ghost moment, and absence of private diary content before delivery.
Deliver the MP4, a poster frame, caption file and reusable composition/source.
Do not publish to YouTube, DEV or another service without a separate request.

## Completed production

Output: `deliverables/ghost-diary-demo.mp4`, 90.000 seconds, 1920×1080,
H.264 at 30 fps with stereo AAC 48 kHz, 24,250,546 bytes. English captions are
burned in and provided separately as `.en.srt`; poster and reusable Remotion
source ZIP are included. SHA-256 and technical checks are in
`deliverables/verification.json`.

The real generated line was “I traced the bent spoke with my finger.” Its
history detail occurs in the earlier fictional umbrella page. Exact diary
evidence is packaged in the video source. The actual local Windows speech WAV
was downloaded from the real player and synchronized into the film.

The real browser viewport was captured as timestamped screenshots at roughly
7–8 samples per second, then encoded into held-frame 30 fps footage. This is
not native 30 fps screen acquisition. Typing was slowed for readability and
the inference wait shortened with an on-screen label. The raw captures remain
under `artifacts/video-capture`.

Seven visual checkpoints and caption line wrapping were reviewed. The full
90-second final file decoded with zero errors. Browser playback confirmed
1920×1080, duration 90, readyState 4, no media error, and successful seeking
to the ghost moment with the entire 0–90s range seekable. Narration and ghost
speech do not overlap. No soundtrack or external publication was added.
