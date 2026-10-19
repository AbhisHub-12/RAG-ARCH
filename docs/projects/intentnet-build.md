## IntentNet — deep build guide

The hands-on path to build IntentNet: turn a plain-English change request into a
**validated, human-approved** device configuration. The safety spine is **Batfish**
(prove the change is correct *before* it ships) and a **human approval** gate inside a
LangGraph workflow. Build it phase by phase.

> Like NetPulse, you can develop entirely against containerlab + Batfish — no production
> gear until you're ready.

---

### Phase 0 — Prerequisites & project layout

Install **Python 3.11+** and **Docker**. Batfish runs as a container.

```
intentnet/
├─ snapshots/baseline/configs/   # device configs Batfish analyzes
├─ app/
│  ├─ schema.py          # Pydantic intent models
│  ├─ interpret.py       # LLM: request -> structured intent
│  ├─ templates/         # Jinja2 config templates
│  ├─ generate.py        # intent -> candidate config
│  ├─ validate.py        # Batfish pre-change checks
│  ├─ graph.py           # LangGraph workflow w/ human approval
│  ├─ apply.py           # push after approval (Netmiko) + audit
│  └─ settings.py
├─ requirements.txt
└─ .env
```

`requirements.txt`:

```
langgraph
langchain
langchain-openai
pydantic
pybatfish
jinja2
netmiko
pydantic-settings
```

Run Batfish:

```bash
docker run -d --name batfish -p 9997:9997 -p 9996:9996 batfish/allinone
```

**Check:** `docker ps` shows the batfish container healthy.

---

### Phase 1 — Model the network in Batfish

Put each device's running config under `snapshots/baseline/configs/` (e.g. `r1.cfg`,
`r2.cfg` — you can export these from your containerlab FRR/Arista nodes). Then:

```python
from pybatfish.client.session import Session

bf = Session(host="localhost")
bf.set_network("intentnet")
bf.init_snapshot("snapshots/baseline", name="baseline", overwrite=True)

# sanity questions
print(bf.q.initIssues().answer().frame())        # parse/config issues
print(bf.q.interfaceProperties().answer().frame())
```

Batfish builds a vendor-neutral model of the whole network from the configs. That model is
what lets you ask "what if I apply this change?" *before* touching anything.

**Check:** `initIssues()` returns a (hopefully empty) table — your baseline parses cleanly.

---

### Phase 2 — Define the intent schema (Pydantic)

Constrain what a "change" can be so the LLM can't emit arbitrary instructions.

`app/schema.py`:

```python
from typing import Literal
from pydantic import BaseModel, Field

class AddVlan(BaseModel):
    kind: Literal["add_vlan"] = "add_vlan"
    device: str = Field(..., description="target device hostname")
    vlan_id: int = Field(..., ge=1, le=4094)
    name: str
    tagged_uplink: str = Field(..., description="uplink interface to trunk the VLAN on")

class AllowService(BaseModel):
    kind: Literal["allow_service"] = "allow_service"
    device: str
    acl_name: str
    protocol: Literal["tcp", "udp"]
    port: int = Field(..., ge=1, le=65535)

Intent = AddVlan | AllowService   # the set of changes IntentNet supports
```

**Check:** `AddVlan(device="r1", vlan_id=50, name="voice", tagged_uplink="eth1")` validates; `vlan_id=9999` raises.

---

### Phase 3 — Interpret: natural language → structured intent

`app/interpret.py` — use the LLM's structured-output mode so you get a typed object, not free text:

```python
from langchain_openai import ChatOpenAI
from app.schema import AddVlan, AllowService
from app.settings import settings

llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key)

def interpret(request: str):
    # ask the model to choose + fill ONE intent model
    structured = llm.with_structured_output(AddVlan)   # swap/branch to AllowService as needed
    return structured.invoke(
        f"Convert this network change request into a structured intent:\n{request}"
    )
```

In production you'd route to the right model (a classifier or a union tool-call). For a
first build, support one change type end to end, then add more.

**Check:** `interpret("add vlan 50 called voice to r1, trunk it on eth1")` → a valid `AddVlan`.

---

### Phase 4 — Generate config from trusted templates (Jinja2)

Never let the LLM free-write config — render from reviewed templates.

`app/templates/add_vlan.j2`:

```jinja
vlan {{ vlan_id }}
 name {{ name }}
!
interface {{ tagged_uplink }}
 switchport trunk allowed vlan add {{ vlan_id }}
```

`app/generate.py`:

```python
from jinja2 import Environment, FileSystemLoader
env = Environment(loader=FileSystemLoader("app/templates"))

def render(intent) -> str:
    template = env.get_template(f"{intent.kind}.j2")
    return template.render(**intent.model_dump())
```

**Check:** `render(AddVlan(...))` produces the exact config lines you expect.

---

### Phase 5 — Validate the change with Batfish (the safety net)

Fork the baseline, apply the candidate lines, and re-ask Batfish — then diff against baseline.

`app/validate.py`:

```python
from pybatfish.client.session import Session

def validate(device: str, candidate_cfg: str) -> dict:
    bf = Session(host="localhost")
    bf.set_network("intentnet")

    # 1) write a proposed snapshot = baseline + the change on `device`
    import shutil, os
    shutil.copytree("snapshots/baseline", "snapshots/proposed", dirs_exist_ok=True)
    with open(f"snapshots/proposed/configs/{device}.cfg", "a") as fh:
        fh.write("\n" + candidate_cfg + "\n")
    bf.init_snapshot("snapshots/proposed", name="proposed", overwrite=True)

    # 2) does it even parse? any new issues?
    issues = bf.q.initIssues().answer().frame()

    # 3) did reachability change unexpectedly? (compare proposed vs baseline)
    diff = bf.q.differentialReachability().answer(
        snapshot="proposed", reference_snapshot="baseline"
    ).frame()

    return {
        "parses": issues.empty,
        "new_issues": issues.to_dict("records"),
        "reachability_changes": diff.to_dict("records"),
    }
```

This is **pre-change verification**: Batfish catches parse errors, broken reachability,
ACL violations, and loops before deployment.

**Check:** a good change → `parses: True`, no surprising reachability changes; a bad VLAN/ACL → issues surface.

---

### Phase 6 — The LangGraph workflow with a human-approval gate

Assemble interpret → generate → validate → **pause for human** → apply. LangGraph's
`interrupt()` pauses the graph and persists state until a human resumes it.

`app/graph.py`:

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command
from app.interpret import interpret
from app.generate import render
from app.validate import validate
from app.apply import apply_change

class S(TypedDict):
    request: str
    intent: dict
    config: str
    report: dict
    approved: bool

def n_interpret(s): return {"intent": interpret(s["request"])}
def n_generate(s): return {"config": render(s["intent"])}
def n_validate(s): return {"report": validate(s["intent"].device, s["config"])}

def n_approve(s):
    # show the human the intent, the diff, and Batfish's findings; wait for yes/no
    decision = interrupt({
        "config": s["config"], "report": s["report"],
    })
    return {"approved": decision == "approve"}

def n_apply(s):
    if s["approved"]:
        apply_change(s["intent"].device, s["config"])
    return {}

g = StateGraph(S)
for name, fn in [("interpret", n_interpret), ("generate", n_generate),
                 ("validate", n_validate), ("approve", n_approve), ("apply", n_apply)]:
    g.add_node(name, fn)
g.add_edge(START, "interpret")
g.add_edge("interpret", "generate")
g.add_edge("generate", "validate")
g.add_edge("validate", "approve")
g.add_edge("approve", "apply")
g.add_edge("apply", END)

workflow = g.compile(checkpointer=MemorySaver())   # checkpointer is required for interrupt()
```

Run it — it stops at the approval gate, then you resume with the decision:

```python
cfg = {"configurable": {"thread_id": "chg-001"}}
state = workflow.invoke({"request": "add vlan 50 'voice' to r1 trunk eth1"}, cfg)
print(state["__interrupt__"])          # the human sees config + Batfish report here
workflow.invoke(Command(resume="approve"), cfg)   # or resume="reject"
```

**Check:** the graph pauses after validation; resuming with `"approve"` runs apply, `"reject"` skips it.

---

### Phase 7 — Apply after approval + audit

`app/apply.py` — push the config (read/write here, unlike NetPulse) and record everything:

```python
import json, datetime
from netmiko import ConnectHandler
from app.settings import settings

def apply_change(device_host: str, config: str):
    conn = ConnectHandler(device_type="arista_eos", host=device_host,
                          username=settings.device_user, password=settings.device_password)
    try:
        out = conn.send_config_set(config.splitlines())
    finally:
        conn.disconnect()
    with open("audit.log", "a") as fh:
        fh.write(json.dumps({
            "ts": datetime.datetime.utcnow().isoformat(),
            "device": device_host, "config": config, "result": out,
        }) + "\n")
```

**Check:** after approval, the device shows the new VLAN; `audit.log` has the full record.

---

### Phase 8 — Run it end to end

```bash
docker run -d --name batfish -p 9997:9997 -p 9996:9996 batfish/allinone
python -c "from app.graph import workflow"   # smoke import
# then drive the workflow from a REPL or a small FastAPI UI (add an SSE/approve endpoint)
```

### Where to take it next

- **More change types** — add Jinja2 templates + Pydantic models; route the interpreter.
- **Richer Batfish checks** — policy questions (`bgpSessionStatus`, `aclReachability`), config-compliance.
- **Real approval UI** — surface the interrupt payload (config diff + Batfish report) to a reviewer; resume on click.
- **Rollback** — snapshot pre-change state; generate the inverse config for one-click revert.
- **Connect to NetPulse** — let the troubleshooting copilot *propose* a change that IntentNet then validates and applies.
