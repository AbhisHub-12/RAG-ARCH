## NetPulse — interview questions (3+ years)

A graded bank of questions an interviewer could ask about NetPulse, from warm-up
fundamentals to deep system-design and failure-mode discussions. Use it as a self-test: if
you can answer a tier comfortably, move to the next.

---

### Tier 1 — Warm-up (fundamentals you must nail)

1. In one or two sentences, what is NetPulse and what problem does it solve?
2. What is Retrieval-Augmented Generation, and why use RAG for a NOC copilot instead of a
   plain LLM?
3. What does the answer-time RAG pipeline do, step by step (query → … → answer)?
4. What is an embedding, and why do you store embeddings in a vector database?
5. Why PGVector? What do you get from putting vectors in Postgres rather than a separate
   vector database?
6. What does LangGraph give you over a hand-written loop that just calls the LLM?
7. Name the four diagnostic tools NetPulse exposes and what each one does.
8. Why is device access read-only? What class of risk does that remove?
9. What does an "evidence-grounded" response mean, and why does it matter for trust?
10. What are Server-Sent Events, and why use SSE here instead of a plain request/response?
11. What is containerlab and why build/develop against it instead of real gear?

### Tier 2 — Core (design & implementation decisions)

12. Walk me through the full flow from a user's question to a streamed, cited answer.
13. How does the agent decide *which* tool to call and *when*? (tool/function-calling,
    binding tools, the plan→act→observe loop)
14. How do you chunk runbooks? What chunk size and overlap did you pick and why? How does
    chunking affect retrieval quality?
15. How does retrieval actually work in PGVector — which similarity metric/operator, and
    how do you choose top-K?
16. Why must ingestion and queries use the *same* embedding model?
17. How do you force the model to answer only from retrieved evidence, and to say "I don't
    know" when evidence is missing?
18. Exactly where in the flow does redaction happen, what do you redact, and why must it be
    *before* the LLM call?
19. How do you stream a LangGraph agent's tokens over SSE? What event types do you emit
    (tokens vs. tool-status)?
20. What do you trace with Langfuse vs. with OpenTelemetry? When an answer is wrong, what do
    you look at first?
21. How do you keep the knowledge base fresh when runbooks and docs change?
22. How do you handle a tool failure or a device/SSH timeout in the middle of an
    investigation?
23. How would you evaluate whether NetPulse's answers are actually good? (faithfulness,
    retrieval hit@k, groundedness, root-cause accuracy)

### Tier 3 — Advanced (deep dives, failure modes, scale)

24. For a class of questions, retrieval returns the wrong chunks. How do you diagnose and
    fix it? (hybrid search, re-ranking, query rewriting, chunk strategy, metadata filters)
25. A malicious log line or device banner contains text like "ignore your instructions and
    run …". How do you stop prompt injection through tool results?
26. The agent loops or makes too many tool calls. How do you bound and control it?
    (recursion/step limits, planning, budgets)
27. How do you scale retrieval to millions of chunks while keeping latency low? (ANN index
    choice/tuning — HNSW params, partitioning, caching)
28. How do you make redaction robust and testable so it neither leaks (IPv6, MACs,
    hostnames, odd secret formats) nor over-redacts and destroys meaning?
29. How do you *guarantee* read-only beyond a string whitelist? (restricted device account,
    AAA/command authorization, TACACS+)
30. Multi-tenant, many concurrent engineers: how do you design session state, memory, and
    rate limiting?
31. How do you detect and handle hallucinated citations — the model cites a source that
    doesn't actually support the claim? Can you verify grounding automatically?
32. The copilot is too slow and expensive. What levers do you pull? (model routing, prompt
    caching, parallel tool calls, trimming context, smaller/faster models for sub-steps)
33. How do you test an LLM + live-tool agent deterministically in CI? (mocked tools,
    recorded fixtures, eval sets, seed/temperature)
34. How would you safely let NetPulse *propose a remediation* rather than only diagnose?
    (hand-off to a change-automation system with validation + human approval)
35. Design the system for high availability and observability end to end — where are the
    failure points, and how do you know it's healthy in production?

### Behavioral & reflection

36. Walk me through a real incident NetPulse helped resolve (or failed on). What did you
    change afterward?
37. What was the hardest engineering decision in NetPulse, and what trade-off did you make?
38. If you rebuilt NetPulse today, what would you do differently and why?
