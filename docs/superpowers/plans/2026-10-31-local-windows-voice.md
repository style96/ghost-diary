# Local Windows Ghost Voice

User direction: reuse the exact pre-ElevenLabs Windows voice pipeline; no new sound design. Keep ElevenLabs for recorded demo. Local functionality is sufficient; no cross-platform expansion.

Implementation: add a loopback-only POST /api/voice returning an in-memory WAV. Send only the current haunting edits after an explicit playback click. Reuse System.Speech default desktop voice, rate -1, volume 90, mono 22050 Hz PCM and the existing Python slowdown/filter/delay algorithm. Use temporary files and fixed subprocess arguments with no shell interpolation. Return recoverable errors. Abort, stop and release generated audio on cancellation, entry changes and unmount.

- [x] Test voice request validation, origin restrictions, failure recovery, concurrent generation and client sentence-only payload.
- [x] Extract the existing processor into a reusable single-file function while preserving original batch behavior.
- [x] Add Windows speech subprocess and protected HTTP route.
- [x] Connect the existing voice control to lazy local WAV generation and cancellation.
- [x] Verify unit tests, typecheck, both builds and real Windows-generated WAV; leave recorded manifest unchanged.

Ruling: user has explicitly chosen the existing sound and asked to make the function work, so implement in the current feature branch with existing changes preserved and no further sound selection or design approval round.

Verification on 2026-10-31: 135 tests passed across 21 files; standalone typecheck and both builds passed; diff whitespace check passed. The legacy first raw WAV processed through the extracted function was byte-identical to `public/audio/recorded-1.wav`. A real Windows smoke generated a 183,192-byte WAV for the current first fictional insertion without changing the recorded manifest. The initial PS1 file invocation encountered Windows script execution policy; the final implementation invokes fixed PowerShell commands with paths in environment variables, without changing execution policy or interpolating diary text into code.

Independent read-only review found no substantive bugs. Started the local server at `http://127.0.0.1:3001` and selected the existing fictional umbrella test entry without editing diary contents. Clicking Hear the ghost generated a local blob WAV that decoded with no media error and played to completion (4.427392s). Repeat playback and stop/rewind verified `paused=true` and `currentTime=0`. Server remains running for the user. Recorded demo still uses the approved ElevenLabs whispers; no deployment or external speech request was made for the local feature.
