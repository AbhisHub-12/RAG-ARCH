// Portfolio projects shown under /projects. Prose lives in docs/projects/*.md and is
// imported here (single source of truth), rendered by the project pages.
import netpulseDoc from '../../docs/projects/netpulse.md?raw'
import intentnetDoc from '../../docs/projects/intentnet.md?raw'

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
    doc: netpulseDoc,
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
    doc: intentnetDoc,
  },
]

export const getProject = (slug) => projects.find((p) => p.slug === slug)
