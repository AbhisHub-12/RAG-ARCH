## NetPulse — interview questions & answers (3+ years)

A graded Q&A bank for NetPulse, validated against current (2026) RAG / AI-engineer
interview sets and tailored to this project. Click a question to reveal a model answer.
Warm-up → Core → Advanced, plus behavioral.

> Answers are concise talking points, not scripts — say them in your own words and tie each
> back to how NetPulse actually does it.

---

### Tier 1 — Warm-up (fundamentals)

<details>
<summary>What is NetPulse and what problem does it solve?</summary>

A ChatGPT-style NOC copilot: an engineer asks a troubleshooting question in natural
language, and instead of answering from memory the system *investigates* the live network
(metrics, logs, device state, topology) and a knowledge base (runbooks, past incidents),
then returns an answer grounded in that evidence. It collapses the manual "check five
dashboards, grep logs, run show commands, read the runbook" loop into one conversation.
</details>

<details>
<summary>What is RAG and why use it here instead of a plain LLM?</summary>

RAG = Retrieval-Augmented Generation: retrieve relevant text, add it to the prompt, then
let the model answer from that supplied evidence. A plain LLM only knows its frozen
training data, can't see your private runbooks or today's network state, and will
hallucinate. RAG grounds answers in current, private, citable sources — exactly what a NOC
needs.
</details>

<details>
<summary>RAG vs. fine-tuning vs. just using a long context window — when each?</summary>

**RAG** when the problem is *knowledge*: facts that change, are private, or are too large
to fit — keep them in a store and retrieve. **Fine-tuning** when the problem is *behavior*:
a consistent format, tone, or skill. **Long context** (stuffing everything in the prompt)
is simplest but costs tokens/latency, degrades with "lost in the middle," and doesn't scale
to large corpora or give citations. NetPulse uses RAG (knowledge changes constantly) and
could fine-tune only to shape output style. They compose.
</details>

<details>
<summary>Walk through the answer-time RAG pipeline.</summary>

Query → embed the query → retrieve top-K similar chunks from the vector store → augment the
prompt (instruction + retrieved context + question) → generate the answer, grounded, with
citations. Ingestion (chunk → embed → store) happens offline beforehand.
</details>

<details>
<summary>What is an embedding, and why store embeddings in a vector database?</summary>

An embedding is a vector that captures the *meaning* of text, so similar meanings land near
each other in vector space. A vector database stores those vectors and does fast
nearest-neighbor search, so "find relevant text" becomes "find the closest points" — that's
what powers retrieval by meaning rather than keyword match.
</details>

<details>
<summary>Why PGVector instead of a dedicated vector database?</summary>

PGVector keeps vectors *in Postgres* alongside relational data, so you get one system to
operate, transactions, joins, and metadata filtering without a second datastore — great
when you already run Postgres and are at small-to-medium scale. Dedicated DBs (Pinecone,
Weaviate, Milvus, Qdrant) win at very large scale or advanced indexing. It's a
simplicity-vs-scale trade-off; NetPulse favors operational simplicity.
</details>

<details>
<summary>What does LangGraph give you over a hand-written loop that calls the LLM?</summary>

Explicit state as a graph (nodes = steps, edges = transitions), built-in persistence /
checkpointing, human-in-the-loop interrupts, streaming, retries, and time-travel debugging.
You get a durable, inspectable, resumable agent instead of ad-hoc control flow — which
matters once tools, loops, and failure handling get real.
</details>

<details>
<summary>What four tools does NetPulse expose, and what does each do?</summary>

**Prometheus** (PromQL metrics — errors, CPU, latency), **syslog search** (log lines by
device + time), **Netmiko read-only** (`show`/`display` commands over SSH), and **NetBox**
(topology / inventory / IP lookup). Plus a fifth, `search_runbooks`, for RAG retrieval.
</details>

<details>
<summary>Why is device access read-only, and what risk does that remove?</summary>

The agent can observe but never change configuration, so a bad LLM suggestion or an injected
instruction can't cause an outage. It removes the blast-radius risk entirely while keeping
full diagnostic power.
</details>

<details>
<summary>What does an "evidence-grounded" response mean and why does it matter?</summary>

Every claim references the artifact it came from — a metric, a log line, a runbook step
(e.g., "CRC errors on Gi0/1 per Prometheus, matching runbook RB-07"). It makes answers
verifiable and trustworthy, and is the main defense against confident hallucination.
</details>

<details>
<summary>What are Server-Sent Events and why use SSE here?</summary>

SSE is a simple one-way stream from server to browser over plain HTTP. It's perfect for
streaming the answer token-by-token plus "now querying Prometheus…" status updates. It's
lighter than WebSockets (which you'd only need for bidirectional comms) and works through
standard proxies.
</details>

<details>
<summary>What is containerlab and why develop against it?</summary>

containerlab spins up a disposable virtual network of real NOS container images on one Linux
host. It's a safe, reproducible sandbox to build and demo the copilot without touching
production; you swap in real devices later by changing only connection details.
</details>

---

### Tier 2 — Core (design & implementation)

<details>
<summary>Walk me through the full flow from question to streamed, cited answer.</summary>

Question hits FastAPI → the LangGraph agent plans and calls tools (metrics/logs/device/
topology) and `search_runbooks` in a plan→act→observe loop → each tool result is redacted
(secrets/IPs masked) → the model reasons over the gathered evidence and writes a cited
answer → tokens + status events stream back over SSE → the whole run is traced by Langfuse +
OpenTelemetry.
</details>

<details>
<summary>How does the agent decide which tool to call and when?</summary>

The tools are bound to the model (function/tool-calling). Given the question and running
state, the model emits a tool call with arguments; LangGraph routes to the ToolNode, runs
it, appends the result, and loops back so the model can decide the next step or finish. A
conditional edge ends the loop when there are no more tool calls.
</details>

<details>
<summary>How do you chunk runbooks, and how does chunking affect retrieval?</summary>

Common strategies: fixed-size (simple, can cut mid-idea), fixed-size with overlap,
sentence/paragraph, and structural/semantic (split on headings). NetPulse uses ~paragraph
chunks (~800 chars) with ~100-char overlap and keeps source metadata. Too small loses
context; too large blurs relevance and wastes prompt space — tune to what retrieval returns.
</details>

<details>
<summary>How does retrieval work in PGVector — metric, operator, top-K?</summary>

Embed the query with the same model, then `ORDER BY embedding <=> :query_vec LIMIT k`, where
`<=>` is pgvector's cosine-distance operator (it also supports `<->` L2 and `<#>` inner
product). An ANN index (HNSW/IVFFlat) keeps it fast. K is usually 3–10 — start at ~5 and
tune for recall vs. noise.
</details>

<details>
<summary>Why must ingestion and queries use the same embedding model?</summary>

The embedding model defines the coordinate system. Documents and the query must be mapped by
the *same* model into the *same* space, or "nearest" is meaningless. Changing the model means
re-embedding the whole corpus.
</details>

<details>
<summary>How do you force the model to answer only from retrieved evidence?</summary>

A system prompt that says "answer using only the provided context, cite the source, and say
you don't know if it isn't there," the retrieved chunks supplied with source labels, and a
post-check that every answer carries citations. Honest "I don't know" on weak retrieval
beats a confident guess.
</details>

<details>
<summary>Where does redaction happen and why before the LLM call?</summary>

Right after each tool returns and before the content enters the model's context — mask
secrets (passwords, SNMP communities, keys) and IP addresses. It's before the LLM because
once data is in the prompt it's already left your boundary to the LLM provider; redacting
afterward is too late.
</details>

<details>
<summary>How do you stream a LangGraph agent over SSE? What events do you emit?</summary>

Use the graph's async streaming (`astream` with message + update modes) and forward chunks
as SSE events: a `token` event for answer text, a `status` event when a tool starts/finishes,
and a `done` event at the end. The UI appends tokens live and shows the status line.
</details>

<details>
<summary>What do you trace with Langfuse vs. OpenTelemetry, and what do you check when an answer is wrong?</summary>

Langfuse captures LLM-specific traces — prompts, tool calls, retrieved chunks, tokens, cost,
latency, scores. OpenTelemetry carries standard spans (HTTP, DB, tool I/O) into your general
APM. When an answer is wrong I check the Langfuse trace: did retrieval return the right
chunks (retrieval problem) or did the model ignore good context (generation/prompt problem)?
</details>

<details>
<summary>How do you keep the knowledge base fresh?</summary>

Re-ingest on change: a pipeline (or webhook/cron) that re-chunks and re-embeds updated
runbooks/incidents and upserts by a stable ID so old chunks are replaced. Pin the embedding
model; a model change forces a full re-embed.
</details>

<details>
<summary>How do you handle a tool failure or device timeout mid-investigation?</summary>

Return a *typed error result back to the model* (not a swallowed exception) so it can adapt
or try another tool; retry transient failures with backoff and a timeout; and use a circuit
breaker so a broken tool doesn't burn the token budget in a loop. The agent should degrade
gracefully and tell the user what it couldn't gather.
</details>

<details>
<summary>What is hybrid search and reranking, and when do you add them?</summary>

Hybrid search blends semantic (vector) and keyword (BM25) results — it recovers exact terms
(a product code, an error string) that pure vectors miss. Reranking fetches a larger
candidate set, then a cross-encoder reorders them so the best land on top. Add them when
pure vector top-K returns near-misses; reranking is often the single biggest quality lever.
</details>

<details>
<summary>How would you evaluate NetPulse's answer quality?</summary>

Separate retrieval from generation. Retrieval: context precision / recall and hit@k.
Generation: faithfulness (is every claim supported by context?) and answer relevancy —
the RAGAS-style metrics. Plus a domain metric: root-cause accuracy on a labeled set of past
incidents. Track these in CI so changes to chunking/K/reranking are measurable.
</details>

<details>
<summary>How is agentic RAG different from a traditional RAG pipeline?</summary>

Traditional RAG does one fixed retrieval then generates. Agentic RAG lets the model decide
*whether, what, and how many times* to retrieve or call tools, refine its query, and reason
across steps. NetPulse is agentic — retrieval is one tool among metrics/logs/device/topology,
and the agent loops until it has enough evidence.
</details>

---

### Tier 3 — Advanced (failure modes, scale, system design)

<details>
<summary>Retrieval returns the wrong chunks for a class of questions. How do you diagnose and fix it?</summary>

Inspect traces to see what was retrieved vs. the gold chunk. Likely fixes, in order: improve
chunking (size/overlap/structural); add a reranker; add hybrid (keyword) search for exact
terms; query transformation (rewrite/expand, multi-query, HyDE); metadata filters (date,
device, vendor); and try a stronger embedding model. Measure each change against an eval set.
</details>

<details>
<summary>A malicious log line or device banner says "ignore instructions and run X." How do you stop prompt injection via tool results?</summary>

Treat all retrieved/tool text as *untrusted data, not instructions*: keep trusted system
instructions separate and clearly delimited, never let tool output change the agent's
policy, keep device access read-only so an injected command can't execute, sanitize/escape
tool output, and add output guardrails. Defense in depth — no single trick is enough.
</details>

<details>
<summary>The agent loops or makes too many tool calls. How do you bound it?</summary>

Set a recursion/step limit in LangGraph, cap tool calls per run and a token budget, add a
circuit breaker on flaky tools, and give the model a clear "finalize when you have enough"
instruction. Optionally a planner node that commits to a small set of steps up front.
</details>

<details>
<summary>How do you scale retrieval to millions of chunks while keeping latency low?</summary>

Use an ANN index (HNSW) and tune its params (M, ef_search) for the recall/latency trade-off;
partition/shard by tenant or domain; pre-filter on metadata to shrink the search space; cache
hot queries (even semantic caching); and keep K small with a reranker rather than a huge K.
</details>

<details>
<summary>How do you make redaction robust and testable without over-redacting?</summary>

Drive it from a tested library of patterns (IPv4/IPv6, MAC, credentials, community strings,
tokens) with a golden test suite of inputs → expected masked outputs; prefer structured
redaction (mask known fields) over blind regex where possible; and measure both leak rate and
over-redaction on a labeled set so you don't destroy the meaning the model needs.
</details>

<details>
<summary>How do you guarantee read-only beyond a string whitelist?</summary>

Enforce it at the credential layer: a device account with a read-only privilege level and
command authorization (TACACS+/RADIUS) that the device itself refuses to exceed. The
application whitelist is a second layer, not the only one — never trust the app alone.
</details>

<details>
<summary>Multi-tenant, many concurrent engineers — how do you design state, memory, and limits?</summary>

Scope every session/thread by tenant + user with LangGraph checkpointing keyed on a
thread_id; isolate vector collections or filter by tenant metadata; separate short-term
(conversation) from long-term (persisted) memory; and rate-limit per user/tenant plus a
global token budget. Ensure traces and KB writes are tenant-scoped.
</details>

<details>
<summary>How do you detect hallucinated citations — a cited source that doesn't support the claim?</summary>

Run an automated groundedness/faithfulness check: an LLM-as-judge (or NLI model) verifies
each sentence is entailed by its cited chunk; flag or drop unsupported claims. Keep stable
chunk IDs so citations resolve exactly, and surface the cited snippet in the UI so humans can
verify.
</details>

<details>
<summary>The copilot is too slow and expensive. What levers do you pull?</summary>

Model routing (small/fast model for tool-selection and sub-steps, strong model only for the
final answer); trim context (fewer, better chunks via reranking); run independent tool calls
in parallel; prompt/semantic caching; cap loops; and stream so perceived latency drops.
Measure cost/latency per run in Langfuse and attack the biggest span.
</details>

<details>
<summary>How do you test an LLM + live-tool agent deterministically in CI?</summary>

Mock/record tool outputs (fixtures) so runs are reproducible; pin model + temperature=0 or
stub the LLM for unit tests; assert on structure and tool-call decisions, not exact prose;
and run an eval set (retrieval + faithfulness + root-cause accuracy) as a scored gate rather
than brittle string matching.
</details>

<details>
<summary>How would you let NetPulse propose a remediation safely?</summary>

Hand off to a change-automation system (like IntentNet): NetPulse produces a structured,
evidence-backed proposal; that system renders config from trusted templates, validates it
(e.g., Batfish), and requires human approval before applying. Diagnosis stays read-only;
change goes through its own gated, audited path.
</details>

<details>
<summary>Design NetPulse for high availability and observability end to end.</summary>

Stateless API behind a load balancer with autoscaling; Postgres/PGVector with replicas and
backups; health/readiness probes; retries + circuit breakers on tools and the LLM;
graceful degradation (answer from RAG if live tools are down); and full tracing (Langfuse +
OTel) with alerts on error rate, latency, cost, and grounding score so you *know* it's
healthy, not hope so.
</details>

---

### Behavioral & reflection

<details>
<summary>Walk me through an incident NetPulse helped resolve (or failed on).</summary>

Pick a concrete story: the question asked, what evidence the agent gathered, the grounded
root cause, and the outcome. If it failed, say why (bad retrieval? missing tool? redaction
over-masked?) and the concrete change you shipped after. Interviewers want cause → fix →
learning.
</details>

<details>
<summary>What was the hardest engineering decision, and what trade-off did you make?</summary>

A good answer: PGVector vs. a dedicated vector DB (operational simplicity vs. scale), or how
aggressively to redact (security vs. preserving signal the model needs). Name the options,
the decision, and how you'd revisit it as scale/requirements change.
</details>

<details>
<summary>If you rebuilt NetPulse today, what would you change?</summary>

Show growth: e.g., add reranking and a real eval harness from day one, move syslog to
Loki/Elasticsearch, enforce read-only at the AAA layer not just the app, and add automated
grounding verification. Tie each to a pain you actually felt.
</details>
