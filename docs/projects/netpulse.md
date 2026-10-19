## What NetPulse is

**NetPulse** is a ChatGPT-style assistant for a **Network Operations Center (NOC)**. A
network engineer asks a plain-English question — *"Why is this interface dropping
packets?"* — and instead of answering from memory, NetPulse **investigates the live
network and the knowledge base**, then returns an answer **backed by real evidence**: the
exact metrics, logs, and runbook steps it used.

It is a **RAG system fused with a tool-using agent** — the two halves of this very site,
pointed at a real network.

## The problem it solves

Traditional troubleshooting means an engineer manually checks several monitoring
dashboards, searches logs, reads documentation, and runs diagnostic commands — slow and
error-prone. NetPulse collapses that into one natural-language conversation that gathers
the same evidence automatically and explains it.

## Architecture — how it's made

| Layer | Technology | Role |
|-------|-----------|------|
| Backend | **Python + FastAPI** | HTTP API, auth, request handling |
| Agent orchestration | **LangGraph** | The state-graph agent: plan → call tool → observe → decide → answer |
| LLM + retrieval glue | **LangChain** | Wraps LLM calls and retrieval components |
| Vector store | **PGVector** (Postgres) | Stores embeddings of runbooks, vendor docs, past incidents |
| Metrics tool | **Prometheus** | PromQL queries for live network metrics |
| Topology tool | **NetBox** | Source-of-truth device/topology/IP lookup |
| Device tool | **Netmiko** | Read-only SSH `show` commands on devices |
| Logs tool | **Syslog search** | Finds relevant log lines by device + time window |
| Streaming | **Server-Sent Events (SSE)** | Streams the answer token-by-token to the UI |
| Observability | **Langfuse + OpenTelemetry** | Traces every agent step, tool call, token, and latency |
| Network sandbox | **containerlab** | A safe, disposable virtual network to develop and demo against |

## The agent and its four tools

LangGraph models the agent as a **state graph** — a loop of *plan → act → observe → decide*.
The model chooses **which tool to call and when**, possibly several times (this is
**agentic RAG**, not a single fixed retrieval). Its four tools:

1. **Prometheus** — writes PromQL to pull interface errors, CPU, latency, packet loss.
2. **Syslog search** — greps device/system logs for the relevant devices and time window.
3. **Netmiko (read-only)** — SSHes into devices and runs *show*-style commands only.
4. **NetBox** — looks up topology: what connects to what, IPs, device roles, sites.

## The RAG pipeline (PGVector)

Runbooks, vendor documentation, and historical incidents are chunked, embedded, and stored
in **PGVector**. During an investigation the agent retrieves the most relevant runbook
steps and similar past incidents, so its guidance is grounded in *your* operational
knowledge — not the LLM's generic memory.

## Evidence-grounded responses

Every claim references its supporting artifact: *"Gi0/1 shows 2,300 CRC errors
(Prometheus), matching runbook RB-07 for cabling faults."* Grounding each statement in
retrieved evidence is what makes the answer trustworthy and checkable.

## Security — read-only + redaction

Two guardrails make this safe for a real network:

- **Read-only device access** — the agent can run diagnostic `show` commands but can never
  change configuration.
- **Secret & IP-address redaction** — a scrubbing layer masks credentials and sensitive IPs
  **before** any context is sent to the external LLM, so sensitive data never leaves your
  boundary.

## Streaming & observability

- **Server-Sent Events** push the answer as it's generated (the "typing" effect) plus
  progress updates ("querying Prometheus…").
- **Langfuse** gives an LLM-specific trace of each run — tools called, results, tokens,
  cost, grounding. **OpenTelemetry** carries standard spans into your general observability
  stack.

## How it connects to the containerlab "sandbox"

**Containerlab is the sandbox.** It spins up a disposable virtual network of real
router/switch container images (Cisco, Arista, Nokia SR Linux, FRR) on one Linux host — it
behaves like production but can't break anything real. NetPulse's tools
(Netmiko/Prometheus/syslog) investigate *that* network, while the **LLM reasoning runs
externally via API** with the redaction layer in between. You develop and demo the whole
copilot safely against containerlab before pointing it at real gear.

## How to build it (a phased path)

1. **Stand up the sandbox** — a small containerlab topology (2–3 routers + a host).
2. **Backend skeleton** — FastAPI app with a `/chat` endpoint that streams via SSE.
3. **One tool at a time** — start with Netmiko read-only `show` commands against the lab,
   then add NetBox topology, Prometheus metrics, and syslog search.
4. **RAG** — load a few runbooks into PGVector; add a retrieval step.
5. **The agent** — wire the tools + retrieval into a LangGraph graph (plan → act → observe).
6. **Grounding + safety** — enforce citations; add the redaction layer before LLM calls.
7. **Observability** — instrument with Langfuse + OpenTelemetry.
8. **Harden** — read-only enforcement, auth, evaluation harness.

## Connected repos to study

No single public repo matches NetPulse's exact stack, so study these — each nails one part:

- **[AbhiAnand-1011/NetDocAI](https://github.com/AbhiAnand-1011/NetDocAI)** — the LangGraph
  agent loop (plan → execute_tools → assess → finalize) + RAG + evidence-grounded reports.
- **[zerxen/AINetworkHelperForContainerLab](https://github.com/zerxen/AINetworkHelperForContainerLab)**
  — the containerlab sandbox + read-only/approval + IP abstraction.
- **[E-Conners-Lab/NetworkOps_Platform](https://github.com/E-Conners-Lab/NetworkOps_Platform)**
  — a fuller platform: NetBox, containerlab, Netmiko/SSH, Prometheus, syslog, RAG, RBAC.
- **[jmiliamine/rag-observability-k8s-lab](https://github.com/jmiliamine/rag-observability-k8s-lab)**
  — LangGraph RAG instrumented with OpenTelemetry + Prometheus/Grafana.
- **[gouthamhizz/gen-ai-lab](https://github.com/gouthamhizz/gen-ai-lab)** — FastAPI RAG with
  Prometheus/Grafana + Langfuse tracing.
- **[siddireddynandini0901/netpulse-copilot](https://github.com/siddireddynandini0901/netpulse-copilot)**
  — a same-named NOC copilot (simpler stack) for the overall product shape.
