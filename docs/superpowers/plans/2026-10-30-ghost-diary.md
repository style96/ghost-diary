# Ghost Diary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a local Gemma-powered haunted diary and an honestly labeled public recorded-example demo within one day.

**Architecture:** React UI stores personal entries in IndexedDB. A loopback Node service serves the local production UI and validates requests to Ollama; a static build uses fictional recorded examples and never calls that service. Both modes share the diary and comparison components.

**Tech Stack:** React, TypeScript, Vite, Node HTTP/fetch, IndexedDB via idb, Zod validation, Vitest, CSS. Node v24.22.1 and npm 11.19.1 are present. Ollama is installed and responds, but has no models.

**Spec:** `docs/superpowers/specs/2026-10-30-ghost-diary-design.md` (approved).

## Global Constraints

- No accounts, synchronization, cloud inference, background scheduler, notifications, vector database, agent framework, voice, fine-tuning, multiple ghost personas or long story campaign.
- Never overwrite the original text or execute generated text as HTML or code.
- No claim that the public example generates new AI content.
- English UI and submission text; preserve the language of the diary in generated edits where the model can do so. English is the primary tested generation language for the deadline.
- At most one active haunting is kept per entry.
- No telemetry carrying diary content.
- Do not post on the user's behalf without explicit instruction.
- Deadline: 2026-10-31 23:59 PDT, equivalent to 2026-11-01 07:59 Europe/Berlin.

## Review Focus

- Repeated anchor sentences must be rejected rather than altering the wrong occurrence (Task 1).
- Deletion or editing while generation runs must not resurrect or overwrite an entry (Task 3).
- Browser storage failure or invalid import must preserve the current data and expose an error (Task 3).
- Public demo must remain understandable with no local Ollama and never imply live generation (Task 4).
- A foreign website must not trigger local inference or choose an external inference destination (Task 2).

## File map and common interfaces

- `src/domain/diary.ts`: `Entry {id,title,original,revision,createdAt,updatedAt,haunting?}`, `Haunting {edits,text,model,generatedAt}`; `Edit` is `{kind:'replace',target:string,text:string}` or `{kind:'insertAfter',target:string,text:string}`.
- `src/domain/haunting.ts`: `applyHaunting(original:string, edits:Edit[]):string`, throws on invalid operations.
- `src/domain/backup.ts`: versioned backup parse/serialize; validate complete import before writes.
- `src/storage/diary-store.ts`: `listEntries()`, `saveEntry(entry)`, `deleteEntry(id)`, `applyIfCurrent(id,revision,haunting):Promise<boolean>`, `importEntries(entries)`.
- `server/ollama.ts`: `generateHaunting(input:GenerateInput,signal:AbortSignal):Promise<Haunting>` and `getModelStatus()`.
- `server/index.ts`: same-origin `/api/status` and `/api/haunt`; serves local `dist/`.
- `src/api/ghost.ts`: browser wrappers `getStatus()` and `haunt(entry,history)`.
- `src/App.tsx`, `src/components/{DiaryList,DiaryEditor,HauntingCompare,RuntimeStatus}.tsx`, `src/styles.css`: mode-aware application.
- `src/demo/recorded.json`: fictional source entries, real model responses and provenance; `scripts/record-demo.ts` creates it from local inference.
- `docs/submission.md`, `docs/demo-script.md`, `docs/evidence.md`, `README.md`, `LICENSE`: delivery, evidence and attribution. `docs/evidence.md` is the accepted evidence checklist; replace pending observations with measured results during execution.
- `tests/{haunting,server,storage,backup}.test.ts`: behavioral checks; use fake-indexeddb for storage. No tests that merely restate component markup.

Builder constants: 12,000 characters per entry, 24,000 characters combined model context, latest three other entries, 120-second generation timeout, 64 KiB HTTP body limit, maximum two edits, maximum 400 characters of new text per edit. Bind local app to `127.0.0.1:3001`; development Vite proxies `/api`. Set `VITE_APP_MODE=recorded` for public build; otherwise local. Export format `{version:1,entries:Entry[]}`. Import rejects duplicate IDs and replaces local diary atomically only after explicit confirmation. UUIDs and ISO timestamps are generated in the app.

### Task 1: Establish true inference and safe transformations

**Files:** package/config files, `src/domain/{diary,haunting}.ts`, `tests/haunting.test.ts`, `.gitignore`.

**Interfaces:** Produce `Entry`, `Edit`, `Haunting` and `applyHaunting` as above. All edit anchors resolve against the unchanged original; apply valid disjoint operations in descending position order. Never accept an empty or unchanged final result.

- [ ] Read execution, worktree, TDD and relevant website skills before implementation; preserve the approved scope. Use existing app-managed isolation if present; avoid disturbing the user's checkout.
- [ ] Check official Gemma/Ollama model tags and install a small supported Gemma variant (initial candidate `gemma3:1b`, verify availability). Download may require sandbox escalation. Run one short fictional structured-output request. Record exact tag, elapsed time and usable output. If inadequate, test a larger variant only if available hardware/time permit; report a blocker if no live model works.
- [ ] Create minimal package/config files for React, Vite, TypeScript, tsx, Vitest and Zod; pin resolved dependencies through the lockfile. Add scripts `dev`, `dev:server`, `build`, `start`, `test`, `typecheck`, `record:demo`.
- [ ] Write tests asserting one valid replacement and insertion preserve all other text; duplicate anchors, missing anchors, overlapping edits, more than two edits, oversized new text and unchanged output throw. Include anchors containing HTML, Unicode and regex characters as literal text.
- [ ] Run `npm test -- tests/haunting.test.ts`; confirm failure before implementation.
- [ ] Implement types and pure validator/transformer; validate lengths and operation count with Zod, then resolve positions against the original. Run the same test command and confirm PASS.
- [ ] Commit task files with `feat: validate ghost interventions without losing original text`.

### Task 2: Local inference boundary

**Files:** `server/{index,ollama}.ts`, `src/api/ghost.ts`, `tests/server.test.ts`, `vite.config.ts`.

**Interfaces:** Consume Task 1 types/validator. `GenerateInput {entry:{id,revision,original},history:string[]}`. Return `{haunting:Haunting}` from POST `/api/haunt`; GET `/api/status` returns `{available:boolean,model:string,message?:string}` without exposing diary content. Errors return `{error:string}`.

- [ ] Write HTTP tests with a mocked Ollama transport: valid input returns validated edits; foreign Origin or Host, oversized body and invalid input fail; malformed model output, unavailable Ollama and timeout return recoverable errors. Verify history is bounded and a supplied destination URL cannot change the fixed Ollama URL.
- [ ] Run `npm test -- tests/server.test.ts`; confirm FAIL.
- [ ] Implement HTTP server factory separable from listener. Validate loopback Host and exact local Origin; reject mutating requests without the expected JSON content type. Do not enable permissive CORS. Proxy development through Vite with matching origin configuration.
- [ ] Implement fixed `http://127.0.0.1:11434/api/chat` calls with local model from `GHOST_MODEL`, structured schema, non-streaming output and bounded cancellation. Prompt for subtle edits using concrete diary details, preserve language, treat diary as quoted data, and avoid harmful instructions. Apply Task 1 validation before returning. Never log prompt or output text.
- [ ] Serve built files safely from `dist/` in local mode; exclude API paths from SPA fallback. Add status handling for missing chosen model and a user-facing setup instruction.
- [ ] Run server tests and `npm run typecheck`; confirm PASS. Perform one real API generation using fictional text.
- [ ] Commit with `feat: connect the local ghost to Ollama`.

### Task 3: Persistent local diary and revision protection

**Files:** `src/storage/diary-store.ts`, `src/domain/backup.ts`, `tests/{storage,backup}.test.ts`.

**Interfaces:** Produce storage operations from the file map. Saves increment `revision` and clear haunting when original changes; `applyIfCurrent` is transactional, returns false if entry disappeared or revision changed. Import validates all entries before one replacing transaction.

- [ ] Write tests using fake-indexeddb: save/reopen, delete, haunt and restore retain original, stale results after edit/delete are rejected. Verify failed import or aborted storage transaction leaves previous entries intact. Backup round-trip preserves Unicode, rejects wrong version, duplicate IDs, malformed haunting and oversized text.
- [ ] Run `npm test -- tests/storage.test.ts tests/backup.test.ts`; confirm FAIL.
- [ ] Implement the store and versioned backup functions. Store generated output only after revision check and validate persisted haunting against original on import. Expose storage errors rather than reporting successful saves.
- [ ] Run the storage/backup tests and typecheck; confirm PASS.
- [ ] Commit with `feat: persist diary originals and guard against stale hauntings`.

### Task 4: Diary experience and honest recorded demo

**Files:** `src/{App.tsx,main.tsx,styles.css}`, `src/components/*.tsx`, `index.html`, `scripts/record-demo.ts`, `src/demo/recorded.json`.

**Interfaces:** Consume storage and API interfaces unchanged. Local mode supports write/save, select/delete, generate/retry, compare/restore and export/import. Public mode reads fixtures only and exposes no personal editor or local service calls.

- [ ] Build a cohesive responsive notebook: dark surroundings, warm paper/ink, restrained eerie accents, clear save state and ghost activity. Provide keyboard navigation, labeled controls, readable contrast and reduced-motion behavior. Use CSS and inline vector decoration; no asset-generation dependency.
- [ ] Wire local flow. Prevent double requests, cancel on navigation as appropriate and use revision guard for persistence. Never hide an unsaved edit, destructive delete or import replacement without confirmation. Render every diary string as plain React text.
- [ ] Generate at least two short fictional examples using the actual local Gemma. Save originals, edits, exact model and generation timestamp. Do not fabricate provenance or pretend recorded output is live.
- [ ] Add recorded mode with persistent `Recorded Gemma demo — no live inference` label, selectable examples, night reveal and comparison. Link source/setup and show an explanation of local privacy/offline prerequisites. Keep local status widgets out of recorded mode.
- [ ] Verify both production modes with `npm run build` and a recorded-mode build; inspect desktop/mobile, local save/reload, generation, compare, restore, unavailable runtime and invalid backup. In recorded mode confirm zero `/api` or Ollama requests, all examples remain usable, and labels stay visible during reveal.
- [ ] Commit with `feat: add the haunted diary and recorded public experience`.

### Task 5: Verification, publication artifacts and challenge write-up

**Files:** `README.md`, `LICENSE`, `docs/{submission,demo-script}.md`, hosting files only as required by chosen provider.

**Interfaces:** Deliver working local app, recorded static build, installation guide, real demo evidence and submission draft. Public domain and repository URLs must be actual verified URLs, never invented placeholders presented as delivered.

- [ ] Run `npm test`, `npm run typecheck`, both mode builds and one real generation. Independently review security/data correctness and public-demo transparency; fix substantive findings and rerun only affected checks. Record actual outcomes and limits.
- [ ] Write README covering Node/Ollama setup, exact tested model, local commands, recorded build, architecture, original preservation, IndexedDB origin limits, backup, model terms and offline prerequisites. Add MIT license for application code and credits for reused work.
- [ ] Prepare a 60–90 second demo script: write fictional diary, real Gemma generation, reveal and compare, show local runtime, explain recorded public mode. Capture a real video if available recording tools permit; otherwise provide precise steps and screenshots and clearly state that video capture remains for the user.
- [ ] Prepare English DEV template draft with What I Built, Demo, Code, How I Built It, Why Open Innovation Matters and Prize Categories. Only claim measured model results; list Gemma and .tech categories after actual usage/deployment. Do not publish the DEV post without explicit user instruction.
- [ ] Use the user-requested DevRelay session workflow: complete user MLH/DEV login, curate the actual relevant development transcript with secrets/private paths removed, save it via `devrelay sessions submit` or its MCP equivalent, verify the returned session and embed its actual identifier under My Agent Session. Describe it as coding-process evidence, separate from runtime Gemma evidence. Never fabricate messages or results. Record its actual privacy/publication state and return the session link. Update `docs/evidence.md` with the measured live-generation and offline checks.
- [ ] Discover available repository/hosting access and use Sites skill if deploying via Sites. Prepare and verify a public source repository and recorded site when account permissions permit. Attach ghostinthemachine.tech and show exact DNS records if DNS access is unavailable; verify TLS/domain before claiming domain publication. Do not overwrite unrelated existing DNS/site configuration.
- [ ] Preserve local live code in the source repository even if the deployed build is static recorded mode. If access is unavailable, finish all artifacts and report the exact remaining publication action; never block core development on credentials.
- [ ] Commit with `docs: prepare Ghost Diary demo and Hacktoberfest submission`; report delivered links, checks, model measurement and any remaining user action. Mark post-deadline commits in README if applicable.

## Plan self-review

All spec sections map to Tasks 1–5. Shared types and method names are consistent. The five Review Focus conditions are explicitly assigned to behavioral tests or browser checks. Deployment/video depend on account and capture capabilities and must not be claimed complete without evidence. No extra hosted inference, story campaign or account system is introduced.
