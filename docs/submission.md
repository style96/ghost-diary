---
title: "Ghost Diary: My Local AI Started Writing Between the Lines"
published: false
tags: devchallenge, hf26challenge, ai, gemma
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).*

## What I Built

A diary should have one author. Ghost Diary has an uninvited second one.

You write about your day, save the page, and choose **Pass the night**. A local Gemma model reads your entry and a little of its history, then leaves a sentence you never wrote.

I wanted the unsettling moment to happen inside something familiar: an ordinary notebook, an ordinary evening, and a detail that another presence somehow remembers.

Your original stays intact. You can compare the versions, see the ghost's words, and restore your own with one click.

![Ghost Diary: a notebook with a presence](https://raw.githubusercontent.com/style96/ghost-diary/main/deliverables/ghost-diary-demo.poster.png)

*Illustrated title card from the video below. The demonstration itself shows the real local application.*

## Demo

[Watch the 90-second English demo](https://github.com/style96/ghost-diary/blob/main/deliverables/ghost-diary-demo.mp4) · [English captions](https://github.com/style96/ghost-diary/blob/main/deliverables/ghost-diary-demo.en.srt)

The video follows a genuine local generation, comparison, playback and restore. Gemma's actual line is “I traced the bent spoke with my finger.” The inference wait is shortened and labeled on screen.

You can also explore three fictional pages in the browser:

{% cta https://ghostinthemachine.tech %}
Try Ghost Diary
{% endcta %}

**The website is a recorded demo.** It replays genuine local Gemma outputs; it has no live inference or personal diary editor. No account or model download is needed. The full application runs locally and accepts new entries.

Read the pages in order. Choose **Pass the night**, watch the ink appear, then use **See what changed**, **Hear the ghost**, or **Restore my words**.

The story follows a yellow umbrella. The first page mentions its bent spoke. On the second page, the hook is empty, and the original never names the umbrella. Given the previous entry as context, Gemma adds:

> I examined the bent spoke of the umbrella.

On the third page, the diarist locks the umbrella in a cupboard. Gemma answers:

> I straightened the bent spoke on the umbrella.

The older physical detail becomes evidence that the presence knows what is missing and can reach what has been locked away.

These are curated outputs, copied without rewriting the model's sentences. Their measured requests took approximately 17.3, 3.7 and 21.1 seconds on my machine. The [recording evidence](https://github.com/style96/ghost-diary/blob/main/docs/history-callbacks.md) includes exact contexts, raw replies and rejected candidates. Fresh generations can differ in both quality and speed.

### Giving the ghost a voice

The new ink appears over about 1.2 seconds; reduced-motion preferences show it immediately. Audio is optional and never autoplays.

The website bundles three ElevenLabs Sarah soft-whisper MP3s, generated from the exact fictional insertions with `eleven_v4`. A manifest check hides playback if a recording no longer matches the displayed sentence. Playback makes no live ElevenLabs API call.

In the local Windows application, Windows desktop speech and Python 3 generate each new ghost insertion's voice on the device. Personal diary text is not sent to ElevenLabs. The video uses that actual local speech for the ghost, with separate ElevenLabs explanatory narration.

## Code

{% embed https://github.com/style96/ghost-diary %}

The repository includes the application, model instructions, recorded outputs, tests, video and setup instructions. Application code is MIT licensed; Gemma's weights have separate terms.

## How I Built It

React and TypeScript render the notebook. IndexedDB stores entries in the browser. A small Node server listens on loopback and calls Ollama, running Google's open-weight `gemma3:4b`.

I first tried the 1B variant. It ran, but the prose was weak. Moving to 4B helped, yet the model still sometimes chose overlapping targets or tried to change too much. That made preserving the original part of the design.

The model returns a structured edit against an exact, unique sentence. Here is the second recorded page's actual edit:

```json
{
  "kind": "insertAfter",
  "target": "The third hook beside the door was empty.",
  "text": "I examined the bent spoke of the umbrella."
}
```

Application code validates the result before applying it. Missing, ambiguous or overlapping targets are rejected. The original and haunted version remain separate, and revision checks prevent late responses from overwriting newer writing. A failed local request shows an error and preserves the page.

The harder creative problem was making the ghost specific. Early outputs decorated objects or made changes unrelated to the current scene. I refined the instructions toward a small physical action and selected a sequence where the missing hook and locked cupboard gave those actions a reason to matter.

The model receives today's original and up to three recent originals. Earlier ghost text is excluded, so its own inventions cannot become the diarist's history. That small context was enough for this story without a vector database or agent framework.

To run the application, install Node.js 24+ and Ollama, then:

```sh
git clone https://github.com/style96/ghost-diary.git
cd ghost-diary
ollama pull gemma3:4b
npm install
npm run build
npm start
```

Keep Ollama running and open `http://127.0.0.1:3001`. Write, save, then pass the night. Optional local speech requires Windows desktop speech and Python 3.

## Why Does Open Innovation Matter?

A diary is personal. Running Gemma locally means the central interaction can happen without sending entries to a hosted model service. The browser talks to my local server, which talks to local Ollama.

The openness also lets someone shape their own ghost. Its instructions are in the repository, the model is configurable, and entries can be exported as a JSON backup. Continued local use does not require a hosted inference account or API key.

I tested the local application with my internet connection disconnected, and it continued working. Dependencies, model weights and the production build must already be installed. There is no per-request hosted inference fee; hardware and electricity still have costs.

There are practical limits: browser storage is not encrypted, clearing it can delete the diary, and exported backups contain plain text. Gemma is open-weight under its own terms; the application's MIT license does not replace them.

The public demo is separately hosted on Render at **ghostinthemachine.tech**. GitHub pushes trigger its test-and-build pipeline. It serves fictional examples and bundled audio, while fresh diary generation stays on the user's computer.

## The Spirit of It

The moment I wanted is the empty hook. The diarist notices an absence; another voice remembers exactly what used to hang there. By the third page, a locked cupboard cannot keep that presence out.

A future evaluation could measure how reliably fresh generations recall earlier details. For this version, I kept the freedom small and the edits reversible.

How much freedom would you give a ghost to change your words?

## Prize Categories

- **Best Use of Gemma:** local Gemma 3 4B generates the diary interventions through Ollama.
- **Best Use of Render:** the public recorded demo deploys from GitHub with tests before each build.
- **Best Use of ElevenLabs:** three matching Sarah whisper recordings for the website, plus narration for the local-app video.
- **Best Use of a .tech Domain:** [ghostinthemachine.tech](https://ghostinthemachine.tech), claimed through Hacktoberfest, hosts the recorded experience.

## Related Reading

Two DEV projects provide useful context:

- [Rahul Talreja's local-first AI journal](https://dev.to/rahul_talreja_946a8621542/building-a-private-rag-system-lessons-from-a-local-first-ai-journal-2dol) explores private inference and retrieval. Ghost Diary uses a smaller context: today's page and a few recent originals.
- [Tanvi Malewar's offline Gemma/Ollama app](https://dev.to/tanvimalewar/i-built-a-local-ai-that-tells-me-to-go-outside-gemma-ollama-works-offline-2983) explores a narrow local-model task. Ghost Diary similarly gives the model a bounded role and validates the result.

*AI disclosure: Codex assisted development and the writing/editing of this post. Gemma generates the diary interventions; ElevenLabs generates the recorded narration described above.*
