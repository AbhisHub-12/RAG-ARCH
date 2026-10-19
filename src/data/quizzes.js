// Knowledge-check questions. Each: prompt, options, correct index, explanation.
export const quizzes = {
  basics: {
    title: 'Check: the big idea',
    questions: [
      {
        q: 'What does RAG do before the AI writes an answer?',
        options: [
          'Retrains the model on new data',
          'Retrieves relevant information and adds it to the prompt',
          'Deletes the model\'s old knowledge',
          'Translates the question into another language',
        ],
        answer: 1,
        explain:
          'RAG retrieves relevant text and augments the prompt with it, so the model answers from supplied evidence — no retraining needed.',
      },
      {
        q: 'The "open-book exam" analogy compares RAG to a student who…',
        options: [
          'Memorizes everything perfectly',
          'Guesses when unsure',
          'Looks up the answer in the textbook first',
          'Skips the question',
        ],
        answer: 2,
        explain:
          'RAG lets the model "open the book" — look up relevant material — instead of answering purely from memory.',
      },
    ],
  },
  why: {
    title: 'Check: why RAG',
    questions: [
      {
        q: 'Which problem does RAG mainly address?',
        options: [
          'Models being too fast',
          'Hallucinations and out-of-date / private knowledge',
          'Screens being too small',
          'Keyboards being slow',
        ],
        answer: 1,
        explain:
          'RAG grounds answers in retrieved evidence, reducing hallucinations and letting the model use fresh, private data.',
      },
      {
        q: 'You need the model to use your company\'s latest internal documents. Best tool?',
        options: ['Fine-tuning', 'RAG', 'A bigger monitor', 'Nothing can do this'],
        answer: 1,
        explain:
          'When the issue is "the model doesn\'t know this fact," RAG is the right fit — just keep the documents updated.',
      },
    ],
  },
  concepts: {
    title: 'Check: core concepts',
    questions: [
      {
        q: 'An embedding is…',
        options: [
          'A compressed image',
          'A list of numbers representing the meaning of text',
          'A type of database password',
          'The final answer',
        ],
        answer: 1,
        explain:
          'Embeddings turn text into vectors of meaning so similar ideas end up close together.',
      },
      {
        q: 'Why do we split documents into chunks?',
        options: [
          'To make files bigger',
          'For precision, to fit context limits, and to cut cost',
          'Because the law requires it',
          'To hide information',
        ],
        answer: 1,
        explain:
          'Smaller, focused chunks retrieve more precisely and fit within the model\'s limited context window.',
      },
      {
        q: 'A vector database is best described as…',
        options: [
          'A spreadsheet',
          'A search engine for meaning (nearest-neighbor search)',
          'A word processor',
          'A backup tape',
        ],
        answer: 1,
        explain:
          'Vector databases find the embeddings closest in meaning to a query, fast — the engine behind retrieval.',
      },
    ],
  },
  final: {
    title: 'Final knowledge check',
    questions: [
      {
        q: 'Put the answer-time pipeline in order.',
        options: [
          'Generate → Retrieve → Embed → Query → Augment',
          'Query → Embed → Retrieve → Augment → Generate',
          'Embed → Query → Augment → Generate → Retrieve',
          'Retrieve → Generate → Query → Embed → Augment',
        ],
        answer: 1,
        explain: 'Query → Embed → Retrieve → Augment → Generate is the core RAG flow.',
      },
      {
        q: '"Top-K" refers to…',
        options: [
          'The K best employees',
          'The K most similar chunks kept from retrieval',
          'A keyboard shortcut',
          'The temperature setting',
        ],
        answer: 1,
        explain: 'Top-K is how many of the closest chunks you keep (often 3–5).',
      },
      {
        q: 'Which technique re-sorts retrieved chunks so the best land on top?',
        options: ['Chunking', 'Re-ranking', 'Embedding', 'Ingestion'],
        answer: 1,
        explain: 'Re-ranking uses a more precise model to reorder candidates by relevance.',
      },
      {
        q: 'Multimodal RAG (like RAG-Anything) adds the ability to handle…',
        options: [
          'Only longer text',
          'Images, tables, and equations — not just text',
          'Faster typing',
          'More users at once',
        ],
        answer: 1,
        explain:
          'Multimodal RAG understands and retrieves across images, tables, and equations, not just plain text.',
      },
    ],
  },
}
