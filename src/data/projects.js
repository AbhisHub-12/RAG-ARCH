// Portfolio projects shown under /projects. Prose lives in docs/projects/*.md and is
// imported here (single source of truth), rendered by the project pages.
import netpulseDoc from '../../docs/projects/netpulse.md?raw'
import intentnetDoc from '../../docs/projects/intentnet.md?raw'
import netpulseBuild from '../../docs/projects/netpulse-build.md?raw'
import intentnetBuild from '../../docs/projects/intentnet-build.md?raw'

export const projects = [
  {
    slug: 'netpulse',
    name: 'NetPulse',
    icon: '📡',
    tagline: 'GenAI network troubleshooting copilot',
    summary:
      'A ChatGPT-style NOC assistant that investigates the live network and a knowledge base to answer troubleshooting questions with real evidence.',
    stack: ['Python', 'FastAPI', 'LangGraph', 'LangChain', 'PGVector', 'Prometheus', 'NetBox', 'Netmiko', 'SSE', 'Langfuse', 'OpenTelemetry', 'containerlab'],
    flow: {
      tone: 'retrieve',
      title: 'Request flow',
      note: 'natural-language question → evidence-grounded answer',
      steps: [
        { label: 'Question', sub: 'natural language' },
        { label: 'LangGraph agent', sub: 'plan → act → observe' },
        { label: 'Tools + RAG', sub: 'Prom · syslog · Netmiko · NetBox · PGVector' },
        { label: 'Redact', sub: 'mask secrets + IPs' },
        { label: 'LLM', sub: 'reason' },
        { label: 'Answer', sub: 'streamed (SSE) + cited' },
      ],
    },
    flowEdges: [
      { from: 'Question', to: 'LangGraph agent', carries: 'the natural-language question', why: 'The agent plans which tools and retrieval it needs to investigate the problem.' },
      { from: 'LangGraph agent', to: 'Tools + RAG', carries: 'tool calls', why: 'It gathers evidence — PromQL metrics, syslog, read-only show commands, NetBox topology, and runbook retrieval from PGVector. This loops (plan → act → observe) until it has enough.' },
      { from: 'Tools + RAG', to: 'Redact', carries: 'raw evidence (metrics, logs, configs, runbook chunks)', why: 'Secrets and IP addresses are masked before anything can reach the LLM.' },
      { from: 'Redact', to: 'LLM', carries: 'redacted evidence + the question', why: 'The model reasons over safe, grounded context — not its own memory.' },
      { from: 'LLM', to: 'Answer', carries: 'a cited answer', why: 'Streamed to the user via SSE, with every claim referencing the metric, log, or runbook it came from.' },
    ],
    doc: netpulseDoc,
    buildDoc: netpulseBuild,
  },
  {
    slug: 'intentnet',
    name: 'IntentNet',
    icon: '🛠️',
    tagline: 'Agentic AI for validated network change',
    summary:
      'Turns natural-language network change requests into validated, human-approved device configurations — safe automation behind pre-change verification.',
    stack: ['LangGraph', 'Pydantic', 'Jinja2', 'Batfish', 'Human approval'],
    flow: {
      tone: 'ingest',
      title: 'Change flow',
      note: 'change request → validated, approved config',
      steps: [
        { label: 'Request', sub: 'natural language' },
        { label: 'Interpret', sub: 'intent (Pydantic)' },
        { label: 'Generate', sub: 'config (Jinja2)' },
        { label: 'Validate', sub: 'Batfish pre-check' },
        { label: 'Approve', sub: 'human-in-the-loop' },
        { label: 'Apply', sub: 'audited' },
      ],
    },
    flowEdges: [
      { from: 'Request', to: 'Interpret', carries: 'the natural-language change request', why: 'The LLM parses it into a typed intent, validated by Pydantic so nothing malformed proceeds.' },
      { from: 'Interpret', to: 'Generate', carries: 'a structured intent object', why: 'The intent fills trusted, reviewed Jinja2 templates — config comes from templates, not free text.' },
      { from: 'Generate', to: 'Validate', carries: 'candidate device config', why: 'Batfish models the network WITH the change and checks parsing, reachability, ACLs, and loops — before deployment.' },
      { from: 'Validate', to: 'Approve', carries: 'the config diff + Batfish findings', why: 'The graph pauses; a human reviews the evidence and approves or rejects.' },
      { from: 'Approve', to: 'Apply', carries: 'an approved change', why: 'Only on approval is the config pushed to the device, and the whole run is recorded for audit.' },
    ],
    doc: intentnetDoc,
    buildDoc: intentnetBuild,
  },
]

export const getProject = (slug) => projects.find((p) => p.slug === slug)
