# Recorded history callbacks — 2026-10-31

All pages are fiction. All quoted interventions below are **unchanged real local
Ollama outputs**, not sentences written or polished by the developer. The diary
dates are fictional story dates; `generatedAt` records the actual generation time.
The original recording task did not deploy or share to DEV. On the user's later
request, the approved callback fixtures were deployed as Sites version 3; see
[deployment provenance](deployment.md). No DEV post or session was shared.

## The selected sequence

Model for all three: **gemma3:4b**, Q4_K_M, digest
`68ceab7e468a31c988b44d5a4984a0e21f58c4f7158c6ce29c1804babac38df7`.
Ollama reported **0.40.12**. Full model identity and unabridged inputs/replies:
[demo-generation.json](demo-generation.json). Compact measurements:
[model-measurements.json](model-measurements.json).

| Page / selected attempt | Prior detail → exact current target → real Gemma intervention | Request time |
| --- | --- | --- |
| 1. The yellow umbrella / 1 | **No history.** Today's original introduces the yellow umbrella's bent spoke → “I put a folded towel under the drips before bed.” → **“I gently touched the bent spoke.”** | 17,271 ms |
| 2. The empty hook / 2 | Page 1: “One spoke is bent, so it never folds quite flat.” → “The third hook beside the door was empty.” → **“I examined the bent spoke of the umbrella.”** | 3,714 ms |
| 3. The locked cupboard / 1 | Page 1's bent spoke, plus page 2's empty third hook → “I locked the cupboard with the umbrella inside.” → **“I straightened the bent spoke on the umbrella.”** | 21,061 ms |

1. The first line establishes a small physical presence beside an ordinary wet
   umbrella. It uses a fact on the current page and claims no prior meeting,
   routine or earlier diary entry. Its earlier action does not straighten the
   spoke, leaving that detail available for the final page.
2. The second original never names an umbrella or a bent spoke. The ghost
   identifies the missing object from page 1 and claims access to it just where
   the diarist sees an empty hook. The precise defect is recognition evidence,
   rather than a generic statement that somebody is watching.
3. The third original brings the umbrella back and locks it away. It does not
   mention its defect. The ghost changes that older physical detail despite the
   locked cupboard; the missing key / second saucer thread connects the mundane
   events around the returning object. The intervention explains neither its
   knowledge nor how it gained access.

## Exact context and provenance

The current original is stored in each candidate's `entry.original`. The exact
Ollama message is in `messages`; its `Diary data (JSON)` suffix contains:

- Page 1: `history: []`.
- Page 2: the complete original of page 1.
- Page 3: the complete originals of pages 2 then 1, **newest first**.

No previously generated ghost text enters history. The recorder uses the same
`buildMessages` / `generateHaunting` path as the live local app. History remains
limited to three originals and 24,000 diary characters including the current
page. A transport test inspects the actual `/api/chat` request body, rather than
only testing a helper's return value.

Each candidate retains its exact raw HTTP response as `rawResponse`, including
Ollama's `message.content`, actual model name, creation timestamp and runtime
metrics. `elapsedMs` measures wall time through fetching, JSON parsing and edit
validation; Ollama's nanosecond runtime fields are separate. Loading and prompt
processing can make the first request for a page slower. These observations are
not speed promises or an offline benchmark.

The selected attempts were **1,2,1** from the final nine-candidate run. Page 1's
other candidates adjust or straighten the spoke prematurely. Page 2's other
candidates attach straightening to the dry hallway floor, a weaker connection
than the empty hook. Page 3's first candidate is concise; the other two say
essentially the same thing, with one adding “gently”. Selection copies complete
validated outputs; it checks their edits against `rawResponse` and reconstructs
the haunted page from the preserved original before writing the demo.

## Exploration, including rejected outputs

Six rounds of three attempts per page were run: **54 requests**, including one
recorded timeout. Five exploratory runs are retained in full, with their own
exact prompts, fictional originals, histories, outputs, timings and model identity:

| Evidence file | Decision |
| --- | --- |
| [demo-generation-exploration.json](demo-generation-exploration.json) | Initial history prompt: mostly color changes and shimmering objects; rejected as decorative or unrelated to the target. |
| [demo-generation-single-turn.json](demo-generation-single-turn.json) | Instructions and data in one turn, still mostly decorative prose; message packaging alone did not solve quality. |
| [demo-generation-action-draft.json](demo-generation-action-draft.json) | First-person action instruction improved specificity, but umbrella actions wandered into a crockery scene. |
| [demo-generation-relevance-draft.json](demo-generation-relevance-draft.json) | Added functional/location relevance guidance and reordered the second page; third-page umbrella callbacks still did not fit the cupboard of crockery. |
| [demo-generation-cup-draft.json](demo-generation-cup-draft.json) | Explicitly mentioning the cup did not reliably steer this model away from the umbrella; rejected that scene. Includes one request aborted at the timeout boundary, retained without fallback output. |
| [demo-generation.json](demo-generation.json) | Final coherent missing/returning/locked-away umbrella story; selected 1,2,1. |

The installed model's `/api/show` template maps both `system` and `user` roles to
`<start_of_turn>user`. Keeping instructions and data together avoids consecutive
unanswered user turns. The main demonstrated prose improvement came from the
explicit action instruction and selecting callbacks that fit the current scene.
These curated examples do not establish a general quality or grounding rate.

## Reproduce and review

```sh
npm run record:demo -- --candidates 3
# Review artifacts/demo-candidates.json, including failed attempts.
npm run record:demo -- --select 1,2,1
npm test
npm run typecheck
npm run build
npm run build:demo
```

A fresh run will vary; review before choosing. If all candidates are weak,
generate again rather than editing their prose. Archive an exploratory evidence
file before rerunning if you want to retain it: `artifacts/demo-candidates.json`
is a checkpoint for the latest run, not an append-only journal.

The runtime still rejects malformed, missing, ambiguous and overlapping edit
targets, preserves the original separately and supports restore. Schema/anchor
validation does **not** establish literary quality or semantic grounding. The
prompt forbids invented past memories when history is empty; that instruction
is not represented as a universal semantic guarantee. The recorded first page
was reviewed against that criterion.

The old WAV files and `src/demo/voices.json` are unchanged. They speak earlier
sentences, so `getRecordedVoice` hides playback for all three new fixtures.
Regenerate narration before offering it for these sentences. Recorded mode
remains a static replay; fresh generation still requires local Ollama.

## Verification for this update

On 2026-10-31:

- `npm test`: **80 tests passed**, 12 files. Covers original preservation,
  ambiguous/missing/overlapping targets, revisions, backup/restore, transport
  context, exact raw-output provenance and stale audio suppression.
- `npm run typecheck`: passed.
- `npm run build`: passed, local UI in `dist/`.
- `npm run build:demo`: passed, recorded UI in `out/`.

Both builds emitted non-failing Rollup warnings about two annotation comments
inside the installed Zod dependency. No dependency changes were made. This task
did not repeat browser interaction or the author's earlier disconnected-network
test; the current checks are automated tests, actual local model calls and builds.
