// A tiny demo "knowledge base" for the RAG Playground. Retrieval is simulated
// client-side with simple keyword/synonym overlap — no embeddings API, no keys.

export const corpus = [
  {
    id: 'A',
    source: 'Note A — Account help',
    text:
      "To reset your password, click 'Forgot password' on the login page and follow the email link. The link expires in 30 minutes.",
    keywords: ['reset', 'password', 'forgot', 'login', 'log', 'sign', 'account', 'credentials', 'email', 'link', 'access', 'locked'],
  },
  {
    id: 'B',
    source: 'Note B — Refunds',
    text:
      'Refunds are available within 30 days of purchase for orders over $20. Contact support with your order number to start a refund.',
    keywords: ['refund', 'money', 'return', 'purchase', 'order', 'payment', 'charge', 'back', 'cancel'],
  },
  {
    id: 'C',
    source: 'Note C — Support hours',
    text: 'Our support team is available Monday to Friday, 9am to 6pm IST.',
    keywords: ['support', 'hours', 'contact', 'help', 'available', 'open', 'time', 'reach', 'team', 'when'],
  },
  {
    id: 'D',
    source: 'Note D — Shipping',
    text:
      'Standard shipping takes 3–5 business days. Express shipping delivers next day for an extra fee.',
    keywords: ['shipping', 'delivery', 'ship', 'deliver', 'arrive', 'days', 'express', 'standard', 'track', 'package'],
  },
  {
    id: 'E',
    source: 'Note E — Data & privacy',
    text:
      'We never sell your data. You can download or delete all your personal data from Settings → Privacy.',
    keywords: ['data', 'privacy', 'delete', 'download', 'personal', 'gdpr', 'sell', 'settings', 'security'],
  },
]

// A few example questions users can click to try instantly.
export const sampleQuestions = [
  "I can't log in — how do I get a new password?",
  'Can I get my money back on an order?',
  'When can I reach your team?',
  'How long until my package arrives?',
  'How do I remove my personal information?',
]
