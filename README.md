<h1 align="center">◭ RAG-ARCH</h1>
<p align="center"><strong>Retrieve · Augment · Generate — RAG, explained from zero.</strong></p>
<p align="center">An interactive, beginner-first guide to <em>Retrieval-Augmented Generation</em>.</p>

<p align="center">
  <a href="https://abhishub-12.github.io/RAG-ARCH/"><strong>▶ Live site</strong></a> ·
  <a href="./docs">Read the lessons</a> ·
  <a href="https://github.com/hkuds/rag-anything">Inspired by RAG-Anything</a>
</p>

---

## What is this?

**RAG-ARCH** teaches you what Retrieval-Augmented Generation (RAG) is and how it works —
starting from absolute zero, no AI background required. It's built as an interactive
React site and published on GitHub Pages, and every lesson is also available as plain,
readable markdown in [`/docs`](./docs).

> **RAG in one sentence:** look things up first, then let the AI write the answer using
> what it found — like taking an open-book exam instead of answering from memory.

## What you'll learn

- **What RAG is** and the open-book-exam intuition behind it
- **Why** it beats a plain LLM (hallucinations, stale/private data, citations)
- **RAG vs fine-tuning** — when to use which
- The **5-step pipeline**: Query → Embed → Retrieve → Augment → Generate
- The core building blocks: **chunking, embeddings, vector databases, retrieval, generation**
- A **hands-on walkthrough** of a tiny RAG system end to end
- Where RAG goes next: **multimodal RAG (RAG-Anything), GraphRAG, agentic RAG**

## Interactive features

| Feature | What it does |
|---------|--------------|
| 🧭 **Animated pipeline** | Click through the five answer-time stages, each explained in plain English. |
| 🧪 **RAG Playground** | Ask a tiny help-desk a question and watch a full RAG cycle run — retrieval scores, the assembled prompt, and the grounded answer. 100% client-side, no API key. |
| ❓ **Quizzes** | Short knowledge checks after each section, plus a final quiz. |
| 🔍 **Searchable glossary** | 30+ RAG terms with plain-English definitions, filterable as you type. |

## The lessons (also readable on GitHub)

All content lives in [`/docs`](./docs) as standalone markdown — it's the single source of
truth the site renders:

1. [What is RAG?](./docs/01-what-is-rag.md)
2. [Why RAG?](./docs/02-why-rag.md)
3. [The architecture](./docs/03-architecture.md)
4. [The pipeline, step by step](./docs/04-the-pipeline.md)
5. [Chunking](./docs/05-chunking.md)
6. [Embeddings](./docs/06-embeddings.md)
7. [Vector databases](./docs/07-vector-databases.md)
8. [Retrieval](./docs/08-retrieval.md)
9. [Generation](./docs/09-generation.md)
10. [Hands-on walkthrough](./docs/10-hands-on-walkthrough.md)
11. [Beyond the basics (RAG-Anything, GraphRAG, agentic RAG)](./docs/11-rag-anything.md)
12. [Glossary](./docs/glossary.md)

## Run it locally

```bash
# clone and enter
git clone https://github.com/AbhisHub-12/RAG-ARCH.git
cd RAG-ARCH

# install and start the dev server
npm install
npm run dev        # open the printed localhost URL

# production build + local preview
npm run build
npm run preview
```

Requires Node 18+ (built and tested on Node 20).

## Tech stack

- **React 18 + Vite** — fast, component-driven interactive UI
- **react-markdown + remark-gfm** — renders the `/docs` lessons
- **framer-motion** — subtle, accessible animations
- **GitHub Actions → GitHub Pages** — automatic deploy on every push to `main`

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml),
which builds the site and publishes it to GitHub Pages. In the repo settings, set
**Settings → Pages → Build and deployment → Source = GitHub Actions**.

The Vite `base` is set to `/RAG-ARCH/` so asset paths resolve under the Pages sub-path.

## License

[MIT](./LICENSE) · Content synthesized from open web sources (2026) and inspired by
[RAG-Anything](https://github.com/hkuds/rag-anything).
