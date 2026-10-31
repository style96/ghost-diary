# History callbacks

Scope: implement the user's supplied requirements directly in the existing local context mechanism. No deployment, publishing, personal data, dependencies or new services.

1. Strengthen the prompt: select a distinctive fact from supplied original history, connect it to a current sentence without explaining the callback; use only the current page when history is empty.
2. Test the recording path at the actual Ollama transport boundary. Keep newest-first originals, three-entry / 24,000-character limits, exact anchors and reversible edits.
3. Record three fictional connected pages with local gemma3:4b. Save exact messages, raw replies, model identity, duration and all candidates; select complete outputs without editing them.
4. Move the selected validated outputs into recorded.json; retain the voice manifest and test that stale recordings are hidden.
5. Document the callbacks, selection and deadline status. Run tests, typecheck and both builds. Preserve pre-existing edits to docs/evidence.md.

Design choice: prompt guidance plus auditable candidate selection fits the existing architecture. A memory service or generated summaries would add unnecessary state and weaken the original-only context boundary. Semantic grounding remains a model instruction and human-reviewed example criterion, not a claim of automatic factual validation.
