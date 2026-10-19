## NetPulse — deep build guide

This is the hands-on version of the phased path: real commands and copy-pasteable code to
build NetPulse from an empty folder to a working, evidence-grounded, streaming copilot that
investigates a **containerlab** network. Build it **one phase at a time** — each phase ends
with a check so you always have something working.

> You don't need real network gear. containerlab gives you a free, disposable virtual
> network on one Linux host. Swap in real devices later by changing connection details only.

---

### Phase 0 — Prerequisites & project layout

Install: **Python 3.11+**, **Docker**, and **containerlab** (`bash -c "$(curl -sL https://get.containerlab.dev)"`).

```
netpulse/
├─ clab/netpulse.clab.yml      # the virtual network (sandbox)
├─ app/
│  ├─ main.py                  # FastAPI + SSE endpoint
│  ├─ agent.py                 # the LangGraph agent
│  ├─ settings.py              # config via env
│  ├─ safety.py                # secret/IP redaction + read-only guard
│  ├─ observability.py         # Langfuse + OpenTelemetry
│  ├─ tools/
│  │  ├─ devices.py            # Netmiko read-only show commands
│  │  ├─ netbox.py             # topology lookup
│  │  ├─ metrics.py            # Prometheus (PromQL)
│  │  └─ logs.py               # syslog search
│  └─ rag/
│     ├─ ingest.py             # chunk + embed runbooks into PGVector
│     └─ retrieve.py           # similarity search
├─ runbooks/                   # markdown runbooks (the RAG corpus)
├─ docker-compose.yml          # Postgres+pgvector (+ Prometheus)
├─ requirements.txt
└─ .env
```

```bash
python -m venv .venv && source .venv/bin/activate
```

`requirements.txt`:

```
fastapi
uvicorn[standard]
sse-starlette
langgraph
langchain
langchain-openai
langchain-postgres
psycopg[binary]
pgvector
sentence-transformers
netmiko
pynetbox
prometheus-api-client
langfuse
opentelemetry-sdk
opentelemetry-exporter-otlp
opentelemetry-instrumentation-fastapi
pydantic-settings
python-dotenv
```

```bash
pip install -r requirements.txt
```

`app/settings.py` (never hardcode secrets — read them from env):

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = ""
    pg_conn: str = "postgresql+psycopg://netpulse:netpulse@localhost:5432/netpulse"
    netbox_url: str = "http://localhost:8080"
    netbox_token: str = ""
    prometheus_url: str = "http://localhost:9090"
    device_user: str = "admin"
    device_password: str = ""
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    class Config:
        env_file = ".env"

settings = Settings()
```

**Check:** `python -c "from app.settings import settings; print(settings.pg_conn)"` prints the DSN.

---

### Phase 1 — Stand up the containerlab sandbox

`clab/netpulse.clab.yml` — two FRR routers + a Linux host (all free images):

```yaml
name: netpulse
topology:
  nodes:
    r1:
      kind: linux
      image: frrouting/frr:latest
    r2:
      kind: linux
      image: frrouting/frr:latest
    host1:
      kind: linux
      image: alpine:latest
  links:
    - endpoints: ["r1:eth1", "r2:eth1"]
    - endpoints: ["r1:eth2", "host1:eth1"]
```

```bash
sudo containerlab deploy -t clab/netpulse.clab.yml
sudo containerlab inspect -t clab/netpulse.clab.yml   # shows node names + mgmt IPs
```

containerlab gives each node a management IP and SSH. FRR exposes CLI via `vtysh`
(`vtysh -c "show ip route"`). To get real vendor CLIs later, swap the image for Arista
cEOS (`ceos`) or Nokia SR Linux (`srl`) — only the Netmiko `device_type` changes.

**Check:** `sudo docker exec -it clab-netpulse-r1 vtysh -c "show interface brief"` returns output.

---

### Phase 2 — FastAPI backend with SSE streaming

`app/main.py` — a streaming `/chat` endpoint. Start with a fake token stream so you can see
SSE working before the agent exists:

```python
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/chat")
async def chat(q: str):
    async def events():
        for word in f"investigating: {q} ...".split():
            yield {"event": "token", "data": word + " "}
            await asyncio.sleep(0.1)
        yield {"event": "done", "data": "[end]"}
    return EventSourceResponse(events())
```

```bash
uvicorn app.main:app --reload
# then, in another shell:
curl -N "http://localhost:8000/chat?q=why%20is%20r1%20down"
```

**Check:** you see words stream in one by one, then `[end]`.

---

### Phase 3 — Build the four tools (one at a time)

Each tool is a plain Python function decorated with LangChain's `@tool`. Start with
**read-only device access** — the most important safety boundary.

`app/tools/devices.py`:

```python
from langchain_core.tools import tool
from netmiko import ConnectHandler
from app.settings import settings

ALLOWED_PREFIXES = ("show", "display")  # read-only: never allow config/clear/reload

@tool
def run_show_command(host: str, command: str) -> str:
    """Run a READ-ONLY show command on a network device and return the raw output.
    Only 'show'/'display' commands are permitted."""
    cmd = command.strip().lower()
    if not cmd.startswith(ALLOWED_PREFIXES):
        return f"REFUSED: '{command}' is not a read-only command."
    conn = ConnectHandler(
        device_type="linux",           # FRR via vtysh; use 'arista_eos' / 'cisco_ios' for real gear
        host=host,
        username=settings.device_user,
        password=settings.device_password,
    )
    try:
        # FRR: wrap in vtysh; for real NOS, send the command directly
        return conn.send_command(f'vtysh -c "{command}"')
    finally:
        conn.disconnect()
```

`app/tools/netbox.py`:

```python
from langchain_core.tools import tool
import pynetbox
from app.settings import settings

@tool
def lookup_topology(device_name: str) -> str:
    """Look up a device's interfaces and neighbors (topology) from NetBox."""
    nb = pynetbox.api(settings.netbox_url, token=settings.netbox_token)
    dev = nb.dcim.devices.get(name=device_name)
    if not dev:
        return f"No device named {device_name} in NetBox."
    ifaces = nb.dcim.interfaces.filter(device_id=dev.id)
    return "\n".join(f"{i.name} -> {i.connected_endpoints}" for i in ifaces)
```

`app/tools/metrics.py`:

```python
from langchain_core.tools import tool
from prometheus_api_client import PrometheusConnect
from app.settings import settings

@tool
def query_metrics(promql: str) -> str:
    """Run a PromQL query for live network metrics (interface errors, CPU, latency)."""
    prom = PrometheusConnect(url=settings.prometheus_url, disable_ssl=True)
    return str(prom.custom_query(query=promql))
```

`app/tools/logs.py` (file-based syslog for the lab; swap for Loki/Elastic in prod):

```python
from langchain_core.tools import tool

@tool
def search_syslog(device: str, pattern: str, limit: int = 20) -> str:
    """Search collected syslog for lines matching a device + pattern."""
    hits = []
    with open("/var/log/netpulse/syslog.log", "r", errors="ignore") as fh:
        for line in fh:
            if device in line and pattern.lower() in line.lower():
                hits.append(line.rstrip())
    return "\n".join(hits[-limit:]) or "No matching log lines."
```

**Check:** call each function directly (e.g. `run_show_command.invoke({"host": "<r1-mgmt-ip>", "command": "show ip route"})`) and confirm real output / a clean REFUSED for a bad command.

---

### Phase 4 — RAG over runbooks with PGVector

Start Postgres with the vector extension via `docker-compose.yml`:

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: netpulse
      POSTGRES_PASSWORD: netpulse
      POSTGRES_DB: netpulse
    ports: ["5432:5432"]
```

```bash
docker compose up -d db
```

`app/rag/ingest.py` — chunk runbooks, embed, store:

```python
import glob
from langchain_postgres import PGVector
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.settings import settings

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")  # 384-dim, local, free
store = PGVector(embeddings=embeddings, collection_name="runbooks", connection=settings.pg_conn)

def ingest():
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    docs = []
    for path in glob.glob("runbooks/**/*.md", recursive=True):
        text = open(path, encoding="utf-8").read()
        for chunk in splitter.split_text(text):
            docs.append(Document(page_content=chunk, metadata={"source": path}))
    store.add_documents(docs)
    print(f"ingested {len(docs)} chunks")

if __name__ == "__main__":
    ingest()
```

`app/rag/retrieve.py` + expose retrieval **as a tool** (so the agent decides when to use it):

```python
from langchain_core.tools import tool
from app.rag.ingest import store

@tool
def search_runbooks(query: str, k: int = 4) -> str:
    """Search runbooks, vendor docs, and past incidents for relevant guidance."""
    hits = store.similarity_search(query, k=k)
    return "\n\n".join(f"[{d.metadata['source']}] {d.page_content}" for d in hits)
```

Add 3–4 markdown files to `runbooks/` (e.g. `interface-errors.md`, `bgp-down.md`), then:

```bash
python -m app.rag.ingest
```

Under the hood this is cosine nearest-neighbor search — the SQL is
`ORDER BY embedding <=> :query_vec LIMIT k` (`<=>` is pgvector's cosine-distance operator).

**Check:** `search_runbooks.invoke({"query": "crc errors on interface"})` returns relevant runbook chunks.

---

### Phase 5 — The LangGraph agent

Wire the five tools (4 diagnostic + RAG) into a plan→act→observe loop.

`app/agent.py`:

```python
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_openai import ChatOpenAI
from app.settings import settings
from app.tools.devices import run_show_command
from app.tools.netbox import lookup_topology
from app.tools.metrics import query_metrics
from app.tools.logs import search_syslog
from app.rag.retrieve import search_runbooks

TOOLS = [run_show_command, lookup_topology, query_metrics, search_syslog, search_runbooks]

SYSTEM = (
    "You are NetPulse, a network troubleshooting copilot. Investigate using the tools. "
    "Ground EVERY claim in tool output or a retrieved runbook, and cite the source "
    "(tool name or [runbook path]). If evidence is missing, say so — never guess."
)

llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key).bind_tools(TOOLS)

def call_model(state: MessagesState):
    msgs = [("system", SYSTEM)] + state["messages"]
    return {"messages": [llm.invoke(msgs)]}

graph = StateGraph(MessagesState)
graph.add_node("agent", call_model)
graph.add_node("tools", ToolNode(TOOLS))
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", tools_condition)  # -> "tools" if a tool call, else END
graph.add_edge("tools", "agent")                        # loop back after each tool
app_graph = graph.compile()
```

(Shortcut: `from langgraph.prebuilt import create_react_agent; app_graph = create_react_agent(llm, TOOLS, prompt=SYSTEM)` does the same in one line — build it manually once to understand it.)

**Check:**
```python
from app.agent import app_graph
for s in app_graph.stream({"messages": [("user", "why is r1 eth1 dropping packets?")]}):
    print(s)
```
You should see the agent call tools, observe results, and produce a cited answer.

---

### Phase 6 — Grounding + safety (the redaction layer)

`app/safety.py` — mask secrets and IPs **before** any text reaches the LLM:

```python
import re

IPV4 = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
SECRET = re.compile(r"(?i)(password|secret|community|token|key)\s*[:=]\s*\S+")

def redact(text: str) -> str:
    text = SECRET.sub(r"\1: [REDACTED]", text)
    text = IPV4.sub("[IP]", text)
    return text
```

Apply `redact()` to every tool's return value (wrap `ToolNode`, or redact inside each tool).
Two guardrails now hold: **read-only** (the command whitelist in Phase 3) and **redaction**
(here). Grounding comes from the system prompt forcing citations.

**Check:** feed a config snippet with a password + IP through `redact()` → both are masked.

---

### Phase 7 — Stream the agent over SSE

Replace the fake stream from Phase 2 with real agent token streaming:

```python
from app.agent import app_graph

@app.get("/chat")
async def chat(q: str):
    async def events():
        async for mode, chunk in app_graph.astream(
            {"messages": [("user", q)]}, stream_mode=["messages", "updates"]
        ):
            if mode == "messages":
                msg, _ = chunk
                if msg.content:
                    yield {"event": "token", "data": msg.content}
            elif mode == "updates":            # emit "now calling tool X" status
                yield {"event": "status", "data": str(list(chunk.keys()))}
        yield {"event": "done", "data": "[end]"}
    return EventSourceResponse(events())
```

**Check:** `curl -N "http://localhost:8000/chat?q=..."` streams tokens plus `status` events as tools fire.

---

### Phase 8 — Observability (Langfuse + OpenTelemetry)

`app/observability.py`:

```python
# Langfuse — pass this handler in the graph's config callbacks
from langfuse.langchain import CallbackHandler   # (v2 used: from langfuse.callback import CallbackHandler)
langfuse_handler = CallbackHandler()

# OpenTelemetry — trace FastAPI + export via OTLP
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter

def init_otel(app):
    provider = TracerProvider()
    provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
    trace.set_tracer_provider(provider)
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    FastAPIInstrumentor.instrument_app(app)
```

Pass the Langfuse handler when you run the graph:
`app_graph.astream(..., config={"callbacks": [langfuse_handler]})`, and call `init_otel(app)`
at startup. Now every run shows up in Langfuse (tools, tokens, cost, grounding) and spans
flow to your OTel backend.

**Check:** run a query, then open the Langfuse dashboard — you see the full trace.

---

### Phase 9 — Run it end to end

```bash
docker compose up -d db
sudo containerlab deploy -t clab/netpulse.clab.yml
python -m app.rag.ingest
uvicorn app.main:app --reload
curl -N "http://localhost:8000/chat?q=why is the link between r1 and r2 flapping?"
```

You should get a streamed, **evidence-grounded** answer that cites the exact metrics, log
lines, and runbook steps it used — all gathered from the containerlab sandbox.

### Hardening checklist (production)

- Enforce read-only at the credential level (a restricted device account), not just the whitelist.
- Add authn/authz on the API; rate-limit `/chat`.
- Move syslog to Loki/Elasticsearch; scrape devices into Prometheus via `snmp_exporter`.
- Add an **eval harness**: a set of incident → expected-root-cause cases; score grounding + accuracy.
- Pin the embedding model; re-ingest runbooks on change.
- Keep the redaction layer in front of the LLM, always.
