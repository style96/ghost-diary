# Ghost Diary — evidence for the submission

Status: final verification on 2026-10-31 passed **135 tests in 21 files**, typecheck, the local build and the recorded-demo build. The 90-second delivered MP4 decoded completely without errors and its SHA-256 matches `deliverables/verification.json`. See [release verification](release-verification.md) for publication synchronization and its limits. Prior local real inference, diary save/reopen, comparison and restore checks remain documented below. The author reported successful operation with the internet disconnected; that is an author-reported manual test, not an agent-observed run.

## 1. Show that AI is essential

Use fictional diary content written during a real demonstration. Include a distinctive detail such as a yellow umbrella, then show Gemma incorporating it into a subtle intervention. Show the original and haunted text together.

Capture the exact local model identifier, the bounded context supplied, validated operations returned and measured request duration. Avoid sending personal entries to logging/tracing services. The actual user-facing output is stronger evidence than a code snippet alone.

Demonstrate that stopping Ollama makes new live interventions fail clearly, while existing diary entries remain available. Do not silently fall back to recorded output. This establishes that the runtime AI performs the central transformation.

Updated 2026-10-31: the recorded fixtures now contain a new fictional callback sequence generated with real local gemma3:4b calls, selected from multiple candidates without editing the model text. Selected requests took 17,271 / 3,714 / 21,061 ms (docs/model-measurements.json). Full contexts, raw replies, rejected candidates and selection rationale are in [callback evidence](history-callbacks.md). Earlier real local browser generation/compare/restore/reopen checks and screenshots concern the previous fixture. This update was subsequently deployed on the user's request as Sites version 3; the custom domain returned HTTP 200 and the exact new callback strings in its served bundle (see [deployment provenance](deployment.md)). An earlier request against a missing local model produced a recoverable error, with no generated fallback. The full suite includes revision collisions across import, deletion and synchronous storage-failure rollback.

## 2. Show the practical benefit of open innovation

- Local privacy: demonstrate the browser using the loopback application server, which calls local Ollama. Check for external requests in the application flow. State the boundary accurately: local diary inference is local; the public host and optional DevRelay session sharing are separate internet services.
- Offline use: the project author confirmed successful operation after disconnecting the internet connection on October 31, 2026. No separate offline latency measurements or network capture were supplied.
- Control: link the ghost instructions and configurable model name in source, explaining that users can change the behavior or choose another locally compatible model. Do not claim multiple models were tested unless they were.
- Ownership: demonstrate preserving the original and exporting the diary; explain that continued local operation does not depend on a hosted model API account.
- Cost: say “no per-request hosted API fee in local mode,” not “costs nothing.” Local hardware, electricity and domain renewal still exist.

Gemma is open-weight with its own license terms. The application code's MIT license does not replace those terms.

Verified boundaries: fixed loopback Ollama endpoint and Host/Origin guards tested; local production UI uses only packaged assets; both modes inspected without browser console warnings/errors. Backup round-trip and invalid/failed import rollback tested. Gemma terms linked in README. Offline operation is confirmed by the project author's manual test reported above. A full external network packet capture has not been performed; do not claim one was measured.

## 3. Capture how it was built with DevRelay

User requested DevRelay. Installed version: 0.1.27. Codex gateway registered; MLH and linked DEV account connected. A sanitized transcript of actual user/assistant dialogue was uploaded, excluding tool payloads, private paths, credentials and hidden reasoning.

Save the relevant actual coding session after implementation. Keep the significant design choices, real code changes, encountered problems and verification outcomes. Remove secrets, account tokens, private machine paths and unrelated content before sending. Do not include private diary entries; all public examples are fictional.

Distinguish coding assistance from runtime AI: Codex helps build the app, Gemma performs diary interventions, and DevRelay shares the development record. A DevRelay transcript is not proof that a particular runtime generation occurred unless that run is actually present.

Once saved, verify the returned identifier and use the real embed tag in the DEV draft, for example `{% agent_session ACTUAL_ID %}`. Do not publish a made-up identifier or treat a private session as publicly accessible.

Verified saved session: 1318, tool_name codex, 45 messages, published=false (draft). URL: https://dev.to/agent_sessions/ghost-diary-building-a-local-gemma-haunted-notebook-with-codex-rtstae . This ID is embedded in the submission draft. An earlier CLI attempt (1317) defaulted to the wrong tool label and remains an unused private draft; the correct session is 1318. The DEV submission article itself has not been published.

## Suggested short demo

1. Enter a fictional diary with a distinctive everyday detail.
2. Save it and trigger “Pass the night.”
3. Show real Gemma model status, generation and measured elapsed time.
4. Reveal the intervention and compare with the untouched original.
5. Restore the entry.
6. Show a fresh offline generation if that test passed; otherwise omit that claim.
7. Explain that the domain's public examples are recorded Gemma outputs and link the local source and setup.

Suggested write-up thesis, to retain only after verification: “A ghost rewrites my diary, but the model never needs to send it away.”
