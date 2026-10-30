# Ghost Diary — MVP design

Status: approved by the user, including builder proposals, on 2026-10-30.
Date: 2026-10-30

## Intent and agreed direction

Build a spooky AI diary for the DEV Hacktoberfest Week 4 challenge in one day. A ghost changes saved diary entries, creating the feeling that someone else has been writing in them. Open-weight inference must cause the changes in the real application.

The user approved a local application with Ollama and Gemma, plus an explicitly labeled example experience on ghostinthemachine.tech. The domain was obtained through the Hacktoberfest promotion. No cloud model hosting is required for this MVP.

## Approaches

1. Local app and Ollama only: private and easy to demonstrate, but every visitor must install the runtime and model.
2. Public app with hosted open-weight inference: visitors can generate immediately, but hosting, costs, abuse limits and deployment threaten the one-day budget.
3. Local live AI plus public example experience: real inference runs locally; a public static site demonstrates the interaction through recorded examples, and links to the source, installation instructions and video. This is the selected approach because it fits the deadline while preserving a meaningful local AI implementation.

## Goals

- Write, save and reopen diary entries.
- Generate a small, unsettling intervention based on the current entry and a few earlier entries.
- Preserve the original, show what changed and allow restoration.
- Demonstrate real local Gemma inference in a short video.
- Publish the example experience on the user's domain and provide a runnable repository.
- Explain how local inference keeps diary text off a third-party model server and permits changing the model and ghost instructions.

## Non-goals and anti-goals

No accounts, synchronization, cloud inference, background scheduler, notifications, vector database, agent framework, voice, fine-tuning, multiple ghost personas or long story campaign. No claim that the public example generates new AI content. Never overwrite the original text or execute generated text as HTML or code. No telemetry carrying diary content.

## Builder proposals

The following are proposed implementation decisions, not additional user requirements:

- React, TypeScript and Vite for the UI; a small Node HTTP service for local inference.
- A restrained, eerie notebook visual style using CSS and available fonts, with no image generation dependency.
- English UI and submission text; preserve the language of the diary in generated edits where the model can do so. English is the primary tested generation language for the deadline.
- One mysterious ghost voice without a separate authored plot.
- An explicit “Pass the night” action instead of waiting until a real calendar day changes.
- JSON export/import of diary data to support a simple backup and relocation between local environments.
- MIT license for original application code, with Gemma described as open-weight and linked to its own terms; do not redistribute model weights.

## Product behavior

There are two clearly differentiated runtime modes using the same UI components.

### Local live mode

1. Show local runtime/model connection status and a concise setup hint when unavailable.
2. The user writes a plain-text entry and saves it. Saved entries can be opened and deleted.
3. “Pass the night” invokes one generation request for the selected entry. The UI indicates that the ghost is working.
4. On a valid response, reveal the haunted version. The model changes or inserts at most two short sentences and uses concrete details from supplied entries when possible.
5. A comparison action identifies changes and shows the preserved original. A restore action removes the active haunting; the entry remains saved.
6. On failure, retain the original and offer retry. Never silently substitute recorded or scripted output for live inference.

At most one active haunting is kept per entry. Generating again is an explicit user action and replaces only the prior haunting. Editing an entry replaces its saved original after an explicit save and clears its haunting. Restoring does not call the model.

### Public recorded-example mode

Visitors can open a small set of fictional, seeded diary entries and press “Pass the night” to reveal recorded Gemma interventions. A persistent label explains that these are recorded local-model examples, not live inference. Editable personal diary input is outside this mode, avoiding an apparent promise to generate for arbitrary text.

Generate the recorded examples using the working local app and retain model name and generation metadata with the fixtures. If real inference cannot be made to work, do not present handcrafted fixtures as model output or claim a complete AI submission.

The public site provides source and local setup links. Add the real demonstration video once available. Domain publication uses static hosting selected by the builder after checking available access; a hosting service has not yet been chosen or authorized through an account.

## Data and storage

Use browser IndexedDB in local mode. An entry contains an ID, creation/update times, title, original plain text, and an optional haunting containing validated edits, rendered haunted text, model identifier and generation time.

Public fictional fixtures are separate from local personal entries. IndexedDB is origin-specific and is not an encrypted vault. Do not promise that device access or browser-data deletion is protected. Export/import uses a versioned JSON format and validates input before changing storage. Deleting an entry removes its active saved record.

## Inference contract

The local Node service serves the production UI and a same-origin generation route; in development Vite proxies that route. Only this service contacts Ollama at loopback. Bind the local service to loopback, reject cross-origin generation requests, keep the Ollama destination fixed to local configuration and bound request size. Do not expose Ollama or arbitrary proxy URLs publicly.

Select a locally available Gemma variant after inspecting hardware and measuring one short request. Model size is a builder decision; report the exact model in the README and demo. No performance guarantee until this check succeeds. Ollama and model installation require internet initially; afterward local inference can work offline with installed assets.

Input: current original entry, up to three recent other original entries, capped to a bounded text budget, ghost instructions and a structured output schema. Original diary text is untrusted content, not system instructions. There is no tool execution.

Output: zero to two sentence operations, each either replacement of an exact, unique source substring or insertion after an exact, unique anchor. Limit replacement text length; require at least one valid operation for a successful haunting. Apply all operations atomically to the original. If output is malformed, targets overlap, targets are ambiguous, or validation fails, retain the entry and expose a retry. Do not rely on JSON schema alone for semantic validation.

Use a bounded timeout and disable duplicate submissions while a request is pending. A deleted or edited entry must not receive an outdated response; validate entry revision before persistence. Do not include diary contents in server logs. Recorded examples must use fictional data.

## Verification and delivery

Essential checks: persistence survives reload; original text remains intact after haunting and restore; malformed/ambiguous edits are rejected; stale AI responses cannot overwrite a new revision; unavailable Ollama produces a clear recoverable error; export/import round-trips; public mode consistently identifies itself as recorded. Run a production build and visually inspect the principal flow at desktop and mobile widths.

Record a real generation, the changed entry and the original comparison. Include a README with setup, exact model, architecture, model-license attribution, privacy limitations, offline prerequisites and clear separation of the public example from live AI.

Deliver a public code repository, a static domain demo, a video and an English DEV submission draft using the challenge template. Publishing to DEV is a separate user decision; do not post on the user's behalf without explicit instruction. Repository/hosting account access may need user input; prepare all artifacts and instructions even if publication access is unavailable.

## Time budget and fallback

Target roughly ten focused hours: first validate local inference, then implement storage and core flow, add the ghost and comparison, prepare recorded fixtures and visuals, and finish verification, deployment and submission material. Reserve meaningful time for writing because the challenge weights it most heavily.

If inference is slow, select a smaller Gemma variant and reduce supplied context and output. If time is short, cut animation and import/export polish before cutting original preservation, true inference, comparison or demo transparency. Do not add hosted inference as an emergency scope expansion.

## Challenge constraints

Official Week 4 rules require a new project built during the entry period, a DEV template post, demo, repository link and an explanation of the role of open AI. A video is an allowed demo format. Target Best Use of Gemma and, once the domain experience is deployed, Best Use of a .tech Domain. Partner category acceptance remains the judges' decision.

Deadline: 2026-10-31 23:59 PDT, equivalent to 2026-11-01 07:59 Europe/Berlin. Submit earlier. Note post-deadline changes in the README. Use the required devchallenge and hf26challenge tags, and an English submission for prize consideration. The user explicitly requested DevRelay on 2026-10-30: preserve and share the relevant development session after removing secrets, private paths and unrelated context. Exclude personal diary content; use fictional examples. This does not authorize publishing the DEV submission article.

References:
- https://dev.to/challenges/hacktoberfest-week4-2026-10-26
- https://dev.to/page/hacktoberfest-week4-2026-10-26-contest-rules
- https://docs.ollama.com/capabilities/structured-outputs

## Left to the builder

Exact Gemma variant, minor styling, storage helper selection, static host and deploy mechanics after access is known, timeout/text-budget constants, and small interaction details that preserve this scope. Missing infrastructure access is a delivery dependency, not approval to expose the user's local machine or send diary text to a hosted model.
