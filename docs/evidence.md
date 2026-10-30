# Ghost Diary — evidence for the submission

Status: local real inference, diary save/reopen, original comparison, restore and recorded public-demo flows verified. Thirty behavioral tests and typecheck pass; both production builds pass. Physically disconnected-network generation remains unverified.

## 1. Show that AI is essential

Use fictional diary content written during a real demonstration. Include a distinctive detail such as a yellow umbrella, then show Gemma incorporating it into a subtle intervention. Show the original and haunted text together.

Capture the exact local model identifier, the bounded context supplied, validated operations returned and measured request duration. Avoid sending personal entries to logging/tracing services. The actual user-facing output is stronger evidence than a code snippet alone.

Demonstrate that stopping Ollama makes new live interventions fail clearly, while existing diary entries remain available. Do not silently fall back to recorded output. This establishes that the runtime AI performs the central transformation.

Verified: gemma3:4b; three real committed recorded input/output pairs in src/demo/recorded.json; measured requests 5,528 / 7,171 / 7,998 ms (docs/model-measurements.json). Real local browser generation/compare/restore/reopen completed. Comparison and mobile screenshots are in docs/screenshots/. An actual request against a missing local model produced a recoverable error, with no generated fallback. The full suite includes revision collisions across import, deletion and synchronous storage-failure rollback.

## 2. Show the practical benefit of open innovation

- Local privacy: demonstrate the browser using the loopback application server, which calls local Ollama. Check for external requests in the application flow. State the boundary accurately: local diary inference is local; the public host and optional DevRelay session sharing are separate internet services.
- Offline use: after downloading dependencies and weights and caching required assets, run the local production app without internet connectivity and perform a NEW generation. Label this unverified until actually tested. A stopped Wi-Fi icon or screenshots alone are insufficient evidence.
- Control: link the ghost instructions and configurable model name in source, explaining that users can change the behavior or choose another locally compatible model. Do not claim multiple models were tested unless they were.
- Ownership: demonstrate preserving the original and exporting the diary; explain that continued local operation does not depend on a hosted model API account.
- Cost: say “no per-request hosted API fee in local mode,” not “costs nothing.” Local hardware, electricity and domain renewal still exist.

Gemma is open-weight with its own license terms. The application code's MIT license does not replace those terms.

Verified boundaries: fixed loopback Ollama endpoint and Host/Origin guards tested; local production UI uses only packaged assets; both modes inspected without browser console warnings/errors. Backup round-trip and invalid/failed import rollback tested. Gemma terms linked in README. A full external network packet capture and a fresh physically offline generation have NOT been performed; omit claims that these were measured.

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
