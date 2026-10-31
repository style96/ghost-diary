# Ghost voice and ink implementation plan

Goal: preview optional recorded ghost speech and a short ink reveal on the requested feature branch.

User scope: implement both features now; temporary locally generated speech, with ElevenLabs replacement later. No video work or production deployment.

Architecture: three static WAV files generated with Windows speech and a small offline audio processor. A dedicated React player appears only on revealed recorded examples. Source lookup matches the full recorded original and haunting, so arbitrary private entries are never voiced with an unrelated fixture. A replaceable manifest owns audio paths. Ink animation uses CSS on newly revealed edits; comparison and previously opened entries stay static. Reduced-motion removes animation. No new runtime dependencies or external requests.

Branch: codex/ghost-voice-ink, based on current origin/main. Preserve pre-existing documentation modifications and the user's untracked screenshot.

- [x] Test fixture matching and playback stop/cancel behavior before implementation.
- [x] Generate and process three temporary spoken assets; document provenance and regeneration.
- [x] Add accessible explicit play/stop control, recoverable errors, and cleanup on entry change/restore/navigation.
- [x] Add a 1.2-second ink appearance on a fresh haunting only, with reduced-motion support.
- [x] Run tests, typecheck, both builds; verify desktop/mobile preview and audio in browser.
- [ ] Commit only feature files on feature branch; show local recorded preview. Do not merge or deploy.

Review focus: audio must stop when leaving the page, pending play must be cancellable, only exact recorded fixtures may be voiced, markup remains literal text, and reduced-motion must show final ink immediately.

Verification: 36 tests passed, both production builds passed (each includes typecheck), WAV playback reached readyState 4 with advancing currentTime in the browser, and the mobile page width matched the 390px viewport. A review found ink reanimation after About navigation; reproduced in browser, fixed eligibility cleanup, and confirmed zero fresh-ink nodes after returning. Independent follow-up review approved the changes. Existing Zod dependency annotation warnings remain build-only warnings.

Ruling: use the existing working directory on a new requested feature branch, preserving the author's screenshot and documentation differences; no additional worktree is needed for this small preview. Use bundled Windows speech rather than an external audio service. No new runtime dependencies. Manifest text protects future demo regeneration from stale audio.
