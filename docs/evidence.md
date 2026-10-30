# Ghost Diary — evidence for the submission

Status: checklist prepared before implementation; no runtime claim below is verified yet.

## 1. Show that AI is essential

Use fictional diary content written during a real demonstration. Include a distinctive detail such as a yellow umbrella, then show Gemma incorporating it into a subtle intervention. Show the original and haunted text together.

Capture the exact local model identifier, the bounded context supplied, validated operations returned and measured request duration. Avoid sending personal entries to logging/tracing services. The actual user-facing output is stronger evidence than a code snippet alone.

Demonstrate that stopping Ollama makes new live interventions fail clearly, while existing diary entries remain available. Do not silently fall back to recorded output. This establishes that the runtime AI performs the central transformation.

Pending evidence: model tag, real input/output, latency, comparison screenshot, unavailable-model check.

## 2. Show the practical benefit of open innovation

- Local privacy: demonstrate the browser using the loopback application server, which calls local Ollama. Check for external requests in the application flow. State the boundary accurately: local diary inference is local; the public host and optional DevRelay session sharing are separate internet services.
- Offline use: after downloading dependencies and weights and caching required assets, run the local production app without internet connectivity and perform a NEW generation. Label this unverified until actually tested. A stopped Wi-Fi icon or screenshots alone are insufficient evidence.
- Control: link the ghost instructions and configurable model name in source, explaining that users can change the behavior or choose another locally compatible model. Do not claim multiple models were tested unless they were.
- Ownership: demonstrate preserving the original and exporting the diary; explain that continued local operation does not depend on a hosted model API account.
- Cost: say “no per-request hosted API fee in local mode,” not “costs nothing.” Local hardware, electricity and domain renewal still exist.

Gemma is open-weight with its own license terms. The application code's MIT license does not replace those terms.

Pending evidence: network observations, offline fresh generation, export check, exact model/license links.

## 3. Capture how it was built with DevRelay

User requested DevRelay. Installed version: 0.1.27. Codex gateway registered; account sign-in pending at preparation time.

Save the relevant actual coding session after implementation. Keep the significant design choices, real code changes, encountered problems and verification outcomes. Remove secrets, account tokens, private machine paths and unrelated content before sending. Do not include private diary entries; all public examples are fictional.

Distinguish coding assistance from runtime AI: Codex helps build the app, Gemma performs diary interventions, and DevRelay shares the development record. A DevRelay transcript is not proof that a particular runtime generation occurred unless that run is actually present.

Once saved, verify the returned identifier and use the real embed tag in the DEV draft, for example `{% agent_session ACTUAL_ID %}`. Do not publish a made-up identifier or treat a private session as publicly accessible.

Pending evidence: connected account, sanitized transcript, saved session ID/link, confirmed sharing state.

## Suggested short demo

1. Enter a fictional diary with a distinctive everyday detail.
2. Save it and trigger “Pass the night.”
3. Show real Gemma model status, generation and measured elapsed time.
4. Reveal the intervention and compare with the untouched original.
5. Restore the entry.
6. Show a fresh offline generation if that test passed; otherwise omit that claim.
7. Explain that the domain's public examples are recorded Gemma outputs and link the local source and setup.

Suggested write-up thesis, to retain only after verification: “A ghost rewrites my diary, but the model never needs to send it away.”
