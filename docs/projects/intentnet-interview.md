## IntentNet — interview questions (3+ years)

A graded bank of questions for IntentNet, the agentic network-change system. It leans
harder on **safety, validation, and human-in-the-loop** than NetPulse, because IntentNet
*changes* the network rather than just reading it. Warm-up → core → advanced.

---

### Tier 1 — Warm-up (fundamentals you must nail)

1. What does IntentNet do, and how is it fundamentally different from NetPulse?
2. What is "intent-based" change here — what's an "intent" in your system?
3. Why generate config from Jinja2 templates instead of letting the LLM write the
   configuration directly?
4. What is Batfish, and what kinds of problems can it catch *before* deployment?
5. What role does Pydantic play, and why constrain the LLM's output with a schema?
6. What is a human-in-the-loop approval gate, and why is it mandatory for changes?
7. List the stages of the workflow, in order.
8. Why validate the change before applying it — what could go wrong without that step?

### Tier 2 — Core (design & implementation decisions)

9. How do you turn a natural-language change request into a structured, typed intent?
   (structured output / function-calling, the intent schema, validation)
10. How does LangGraph pause for human approval and then resume? (the `interrupt()`
    mechanism, a checkpointer, `Command(resume=...)`, `thread_id`)
11. How do you model a *proposed* change in Batfish and compare it to the current network?
    (baseline snapshot vs. a proposed/reference snapshot, differential questions)
12. Which Batfish questions would you run to gate a change, and what does each tell you?
    (initIssues, differentialReachability, aclReachability, bgpSessionStatus)
13. How do you support multiple vendors and multiple change types cleanly? (template per
    change kind, an intent union, routing the interpreter)
14. How do you make applying a config idempotent and safe to re-run?
15. What goes into the audit record, and why does auditability matter for change
    automation?
16. How do you handle a rejected change, or an approval that never arrives (timeout)?
17. Where exactly is the LLM's freedom constrained so it can't emit an arbitrary or
    dangerous change?

### Tier 3 — Advanced (deep dives, failure modes, safety)

18. Batfish says the change is safe, but production still breaks. Why can the model and
    reality diverge, and how do you shrink that gap? (model fidelity, missing runtime
    state, dynamic routing, control-plane vs. data-plane)
19. Design a reliable rollback. How do you revert a bad change? (pre-change snapshot,
    inverse config, config-replace vs. merge, staged revert)
20. How do you prevent prompt injection in the change request from producing a malicious
    config? What guardrails sit around the LLM?
21. Two changes target the same device/network concurrently. How do you serialize them and
    avoid conflicts? (locking, change windows, re-validate at apply time)
22. How do you test IntentNet end-to-end in CI without touching real gear? (containerlab +
    Batfish + golden configs + assertions)
23. The generated config is valid and Batfish-clean, but it violates an org policy Batfish
    doesn't model. How do you enforce policy/intent? (policy-as-code, compliance checks)
24. How do you govern approvals at scale — who can approve what, and how do you encode that?
    (RBAC, change tiers, policy)
25. Partial failure during a multi-device apply (half applied, half not). How do you keep
    the network consistent? (transactional/2-phase apply, all-or-nothing rollback)
26. How would you evolve IntentNet from assistive toward progressively autonomous while
    staying safe? (confidence gating, canary/staged rollout, blast-radius limits, auto-
    rollback)
27. How do you validate intent *coverage* — that the generated config actually achieves what
    the user asked, not just that it's syntactically valid and reachable?

### Behavioral & reflection

28. Tell me about a risky change IntentNet caught before it shipped — what did Batfish flag?
29. What's the hardest part of building *safe* agentic change automation, and how did you
    approach it?
30. If you extended IntentNet to work with NetPulse (diagnose → propose → validate → apply),
    how would you design that hand-off safely?
