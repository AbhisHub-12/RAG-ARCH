## Why RAG? The problems it solves

Large language models are impressive, but on their own they have four stubborn
weaknesses. RAG was designed to fix exactly these.

### 1. They hallucinate

When an LLM doesn't know something, it often *makes something up* that sounds correct.
This is called a **hallucination**. By handing the model real, retrieved text to work
from, RAG keeps answers **grounded in evidence** — dramatically reducing made-up facts.

### 2. Their knowledge is frozen in the past

A model is trained up to a certain date and then frozen. It doesn't know what happened
afterward, and it can't see private or newly created information. RAG fixes this by
retrieving from a knowledge base **you keep up to date**, so the model can answer about
today's data without being retrained.

### 3. They can't see your private data

Your internal wiki, product manuals, support tickets, and PDFs were never in the model's
training set. RAG lets the model use them at answer-time — your data stays in *your*
store, and only the relevant snippets are passed in when needed.

### 4. They can't easily show their sources

Because a RAG system *retrieves* specific documents, it can tell you **where an answer
came from** — a citation, a link, a page number. That makes answers checkable and
trustworthy.

---

### RAG vs. fine-tuning — what's the difference?

Beginners often confuse these two ways of "teaching" a model. Here's the clean split:

| | **RAG** | **Fine-tuning** |
|---|---|---|
| **What it changes** | The *information* available at answer-time | The model's *weights* (its behavior/style) |
| **Best for** | Facts that change often, private documents | Teaching a consistent tone, format, or skill |
| **Updating knowledge** | Just add/edit documents — instant | Retrain the model — slow and costly |
| **Shows sources?** | Yes, naturally | No |
| **Cost to start** | Low | Higher |

A good rule of thumb:

> Use **RAG** when the problem is *"the model doesn't know this fact."*
> Use **fine-tuning** when the problem is *"the model doesn't answer in the way I want."*
> Many real systems use **both**.

### The payoff

With RAG you get answers that are more **accurate**, more **current**, grounded in
**your** data, and backed by **citations** — all without the expense of retraining a
model every time your information changes.
