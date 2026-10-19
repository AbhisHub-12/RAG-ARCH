## What IntentNet is

**IntentNet** is an **Agentic AI** system that turns a plain-English **network change
request** — *"add VLAN 50 to the access switches in Site B and allow it through the
uplink"* — into a **validated, ready-to-apply device configuration**. Where NetPulse
*reads* the network (troubleshooting), IntentNet *changes* it (configuration) — safely,
behind validation and human approval.

## The problem it solves

Network change is risky: a single typo can cause an outage or a security hole. Engineers
hand-write configs, review them, and hope. IntentNet captures the *intent* in natural
language, generates the config from trusted templates, **proves it's correct before it
touches anything**, and routes it to a human for a final yes/no.

## Architecture — how it's made

| Layer | Technology | Role |
|-------|-----------|------|
| Agent orchestration | **LangGraph** | The workflow graph: interpret → generate → validate → approve → apply |
| Structured validation | **Pydantic** | Enforces a typed schema on the intent and the generated change (no malformed output) |
| Config generation | **Jinja2** | Renders vendor configuration from trusted, reviewed templates |
| Change assurance | **Batfish** | Models the network and verifies the *planned* config before deployment |
| Safety gate | **Human approval workflow** | A person reviews and must approve before anything is applied |

## How the workflow runs

1. **Interpret** — the LLM parses the natural-language request into a **structured intent**
   (validated by Pydantic), so the rest of the pipeline works on typed data, not free text.
2. **Generate** — the intent fills **Jinja2** templates to produce candidate device config.
   Using templates (not raw LLM text) keeps output consistent and within known-good patterns.
3. **Validate** — **Batfish** builds a model of the network *with the proposed change* and
   checks it: Does it parse? Does it break reachability? Violate an ACL policy? Create a
   loop? This is **pre-change verification** — catching problems before they ship.
4. **Approve** — LangGraph **pauses** (human-in-the-loop interrupt). A reviewer sees the
   intent, the diff, and Batfish's findings, then approves or rejects. State persists across
   the pause and resumes on the decision.
5. **Apply** — only after approval is the change pushed (and the whole run is auditable).

## Why each piece matters

- **LangGraph** gives durable, resumable state and a first-class *pause-for-human* step.
- **Pydantic** stops the LLM from emitting malformed or out-of-schema instructions.
- **Jinja2** means configs come from reviewed templates, not improvised text.
- **Batfish** is the safety net: it mathematically checks the change against the network
  model so you *"evolve the network without fear of outages or security breaches."*
- **Human approval** keeps a person accountable for every production change.

## How to build it (a phased path)

1. **Model a sample network** in Batfish and learn its snapshot/what-if query API.
2. **Define the intent schema** with Pydantic (e.g. `AddVlan`, `AllowService`).
3. **Templates** — write Jinja2 templates per vendor for the changes you support.
4. **Generate + validate loop** — LLM → intent → render config → Batfish check → report.
5. **The graph** — assemble interpret → generate → validate → **interrupt (approval)** →
   apply in LangGraph.
6. **Audit** — persist every run (intent, diff, Batfish result, approver, outcome).

## Connected repos & references to study

- **[batfish/batfish](https://github.com/batfish/batfish)** — the network configuration
  analysis engine that guarantees correctness of planned/current configs.
- **[gelevanog/support-agent-langgraph](https://github.com/gelevanog/support-agent-langgraph)**
  — a LangGraph agent with **human-in-the-loop approvals** + full audit trail (the approval
  pattern IntentNet needs).
- **[langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)** — the framework,
  with durable execution and human-oversight interrupts.
- **AskBatfish** (Amar Abane) — a write-up on bridging Batfish with conversational AI /
  LLMs, useful for the natural-language ↔ Batfish side.
