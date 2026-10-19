## IntentNet — interview questions & answers (3+ years)

A graded Q&A bank for IntentNet, the agentic network-change system. It leans harder on
**safety, validation, and human-in-the-loop** than NetPulse, because IntentNet *changes* the
network. Validated against current (2026) agentic-AI / LangGraph interview sets. Click a
question to reveal a model answer.

---

### Tier 1 — Warm-up (fundamentals)

<details>
<summary>What does IntentNet do, and how is it different from NetPulse?</summary>

IntentNet turns a plain-English change request ("add VLAN 50 to Site B access switches and
allow it on the uplink") into a validated, ready-to-apply device configuration — behind
pre-change verification and human approval. NetPulse *reads* the network (troubleshooting);
IntentNet *changes* it (configuration). That difference is why IntentNet's whole design is
about safety gates.
</details>

<details>
<summary>What is an "intent" here?</summary>

A structured, typed representation of what the user wants to change (e.g.
`AddVlan{device, vlan_id, name, uplink}`) — not free text. Capturing intent as data lets the
rest of the pipeline generate, validate, and audit the change deterministically.
</details>

<details>
<summary>Why generate config from Jinja2 templates instead of letting the LLM write it directly?</summary>

Templates are reviewed, known-good, and deterministic. If the LLM free-writes config it can
hallucinate syntax, drift between vendors, or inject something unsafe. The LLM's job is to
fill a *typed intent*; trusted templates turn that intent into config. It constrains the
blast radius of model error.
</details>

<details>
<summary>What is Batfish and what does it catch before deployment?</summary>

Batfish builds a vendor-neutral model of the network from device configs and lets you ask
"what if?" questions. It catches parse errors, broken or changed reachability, ACL
violations, routing loops, and policy issues — *before* anything is deployed, so you can
"evolve the network without fear of outages."
</details>

<details>
<summary>What does Pydantic do and why constrain the LLM with a schema?</summary>

Pydantic defines and validates the intent schema (types, ranges, allowed values). Forcing
the model's output into that schema means malformed or out-of-range changes never proceed —
it's a structural guardrail between the LLM and the rest of the system.
</details>

<details>
<summary>What is the human-in-the-loop approval gate and why is it mandatory?</summary>

Before any change is applied, the workflow pauses and a human reviews the intent, the config
diff, and Batfish's findings, then approves or rejects. It keeps a person accountable for
every production change and is the last safety net if validation missed something.
</details>

<details>
<summary>List the stages of the workflow.</summary>

Interpret (NL → typed intent) → Generate (intent → config via Jinja2) → Validate (Batfish
pre-change check) → Approve (human-in-the-loop) → Apply (push + audit).
</details>

<details>
<summary>Why validate before applying — what goes wrong without it?</summary>

Without pre-change verification you're deploying hope: a typo or a subtle policy break can
cause an outage or security hole that you only discover in production. Validating against a
model first turns "deploy and pray" into "prove, then deploy."
</details>

---

### Tier 2 — Core (design & implementation)

<details>
<summary>How do you turn a natural-language request into a structured, typed intent?</summary>

Use the LLM's structured-output / function-calling mode bound to a Pydantic model
(`with_structured_output(AddVlan)`), so the model must return a valid object. For multiple
change types, classify first or offer a union of intent tools and route to the right one.
Validation rejects anything malformed before it moves on.
</details>

<details>
<summary>How does LangGraph pause for human approval and resume?</summary>

Call `interrupt(payload)` inside the approval node — the runtime checkpoints state and stops,
surfacing the payload (config + Batfish report) to the human. Later you invoke the same
thread with `Command(resume=decision)`; that value becomes the return of `interrupt()` and
the node continues. A checkpointer (and a stable `thread_id`) is required so state survives
the pause.
</details>

<details>
<summary>How do you model a proposed change in Batfish and compare it to the baseline?</summary>

Init a baseline snapshot from current configs, then a "proposed" snapshot = baseline + the
candidate change on the target device. Run questions on the proposed snapshot and use
*differential* questions (e.g. `differentialReachability`) with the baseline as reference to
see exactly what the change alters.
</details>

<details>
<summary>Which Batfish questions gate a change, and what does each tell you?</summary>

`initIssues` (does it parse / any config issues?), `differentialReachability` (did reachability
change unexpectedly?), `aclReachability` (unreachable/again-shadowed ACL lines),
`bgpSessionStatus` / routing questions (did sessions or routes break?). Together they answer
"does this change do only what we intended?"
</details>

<details>
<summary>How do you support multiple vendors and change types cleanly?</summary>

One Pydantic model + one Jinja2 template per change *kind*; an intent union so the interpreter
picks the right one; and vendor-specific template variants selected by device platform
(from NetBox). Adding a change type = add a schema + template + Batfish checks, not new core
logic.
</details>

<details>
<summary>How do you make applying a config idempotent and safe to re-run?</summary>

Prefer declarative/replace semantics or guard commands so re-applying is a no-op if the state
already matches; check current state before applying; and make each change carry a unique id
so retries don't double-apply. Re-validate against live state at apply time, not just at
generate time.
</details>

<details>
<summary>What goes into the audit record and why?</summary>

Timestamp, requester, the natural-language request, the structured intent, the config diff,
the Batfish findings, the approver and decision, and the apply result. It's required for
change governance, incident forensics, and rollback — you must be able to answer "who changed
what, why, and what did we check."
</details>

<details>
<summary>How do you handle a rejected change or an approval that never arrives?</summary>

On reject, skip apply, record the decision, and optionally loop back for a revised intent. On
timeout, because state is checkpointed the run simply waits; add an expiry that cancels stale
pending changes and notifies the requester so nothing dangles indefinitely.
</details>

<details>
<summary>Where is the LLM's freedom constrained so it can't emit a dangerous change?</summary>

At three points: the Pydantic intent schema (only valid, in-range changes), Jinja2 templates
(config comes from reviewed patterns, not model text), and Batfish + human approval (nothing
ships unverified and unapproved). The LLM proposes *intent*; it never directly produces
applied config.
</details>

<details>
<summary>How do you handle tool/validation failures in the agent?</summary>

Return typed error results to the model (not swallowed exceptions) so it can revise; retry
transient Batfish/device errors with backoff; fail closed — if validation can't run, the
change does not proceed to approval. A broken validator must block, never bypass.
</details>

---

### Tier 3 — Advanced (failure modes, safety, scale)

<details>
<summary>Batfish says the change is safe but production breaks anyway. Why, and how do you shrink the gap?</summary>

Models can diverge from reality: missing runtime/data-plane state, stale configs, features
Batfish doesn't fully model, or dynamic routing. Shrink the gap by keeping snapshots fresh
and complete, modeling the whole relevant topology (not one device), adding post-change
verification against live state, and rolling out via canary + auto-rollback so a surprise is
contained.
</details>

<details>
<summary>Design a reliable rollback.</summary>

Snapshot the exact pre-change config/state; generate the inverse change (or keep the prior
config for a replace); on failure or post-change check regression, re-apply the saved config
transactionally; verify with Batfish + live checks that you're back to baseline. Prefer
config-replace over additive merges so rollback is deterministic.
</details>

<details>
<summary>How do you prevent prompt injection in the request from producing a malicious config?</summary>

Treat the request as untrusted: the Pydantic schema limits what an intent can even express,
templates bound the generated config, Batfish + policy checks catch dangerous outcomes, and
human approval is the backstop. Also scope the interpreter so it can't be talked out of its
constraints. The safety doesn't depend on the LLM behaving.
</details>

<details>
<summary>Two changes target the same device/network concurrently. How do you avoid conflicts?</summary>

Serialize per device/blast-radius with a lock or a change queue; re-validate each change
against the *latest* state right before apply (not the state it was generated against); and
use change windows. If two intents conflict, the second re-plans or is rejected.
</details>

<details>
<summary>How do you test IntentNet end to end in CI without real gear?</summary>

Spin up containerlab topologies + Batfish with golden baseline configs; drive the workflow
with a fixed request; auto-approve in test; and assert on the generated config, the Batfish
diff, and the final device state. Stub the LLM (temperature 0 or recorded intents) so runs
are deterministic.
</details>

<details>
<summary>The config is valid and Batfish-clean but violates an org policy Batfish doesn't model. How do you enforce it?</summary>

Add a policy-as-code layer: explicit compliance checks (naming, allowed VLAN ranges, required
ACLs, no telnet, etc.) run as part of validation — an OPA-style rules engine or Batfish's own
policy questions where they fit. Policy violations block approval just like reachability
breaks.
</details>

<details>
<summary>How do you govern approvals at scale?</summary>

RBAC tied to change tiers: low-risk changes may need one approver, high-risk ones need senior
/ change-board approval; encode "who can approve what" as policy; and log everything. The
approval gate reads the risk (blast radius, device criticality) and routes accordingly.
</details>

<details>
<summary>Partial failure during a multi-device apply — half applied, half not. How do you stay consistent?</summary>

Make the change set transactional: stage all device changes, apply with the ability to
roll back any that fail (two-phase / all-or-nothing), and on partial failure revert the
applied ones to the pre-change snapshot. Record the partial state so an operator can
reconcile if auto-rollback itself fails.
</details>

<details>
<summary>How would you evolve IntentNet from assistive toward progressively autonomous, safely?</summary>

Gate autonomy on confidence and risk: auto-apply only low-risk, high-confidence,
policy-clean changes to non-critical devices; keep humans on everything else; add canary +
staged rollout, blast-radius limits, and automatic rollback on regression. Expand the
autonomous envelope only as the eval/audit record earns trust.
</details>

<details>
<summary>How do you validate intent coverage — that the config actually achieves what was asked?</summary>

Beyond "valid and reachable," assert the *goal*: e.g., for "allow service X," run a Batfish
reachability question proving traffic to X is now permitted (and nothing else opened).
Encode each intent's success condition as a positive verification query, not just absence of
errors.
</details>

---

### Behavioral & reflection

<details>
<summary>Tell me about a risky change IntentNet caught before it shipped.</summary>

Tell a concrete story: the requested change, what Batfish flagged (e.g., an ACL change that
would have blackholed a prefix or a VLAN that broke reachability), and how the human-approval
view made the risk obvious. Emphasize that validation + the diff caught it pre-deploy.
</details>

<details>
<summary>What's the hardest part of building safe agentic change automation?</summary>

Earning trust: making the system *provably* safe (schema + templates + validation + approval)
while staying useful, and accepting that the model can be wrong — so safety must live in the
deterministic layers around it, not in the LLM. Modeling fidelity (Batfish vs. reality) and
rollback are the hard, high-stakes parts.
</details>

<details>
<summary>How would you connect IntentNet with NetPulse safely?</summary>

NetPulse diagnoses (read-only) and produces an evidence-backed *proposal*; IntentNet takes
that as an intent, generates config, validates with Batfish, and requires human approval
before applying. The diagnose path stays read-only; the change path keeps all its gates — the
hand-off is a structured proposal, never a direct command.
</details>
