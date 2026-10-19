// A single, optional recap quiz. The focus of this site is the architecture and theory;
// this is just a light self-check at the end.
export const quizzes = {
  final: {
    title: 'Quick recap',
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
        q: 'Why must ingestion and retrieval use the SAME embedding model?',
        options: [
          'To save money',
          'So documents and questions land in the same meaning-space and can be compared',
          'Because the law requires it',
          'To make the answer longer',
        ],
        answer: 1,
        explain:
          'The embedding model is the shared coordinate system; different models would place chunks and questions in incomparable spaces, so "nearest" would be meaningless.',
      },
      {
        q: 'What connects the two phases of the architecture?',
        options: [
          'Nothing — they are independent',
          'The vector database (written by ingestion, read by retrieval) and the shared embedding model',
          'The user interface',
          'The internet connection',
        ],
        answer: 1,
        explain:
          'Ingestion writes vectors into the vector DB; retrieval reads them. Both phases also share the same embedding model. Those are the two bridges.',
      },
      {
        q: 'Why does grounding generation in retrieved context reduce hallucination?',
        options: [
          'It makes the model bigger',
          'The relevant evidence in the prompt makes evidence-supported answers the most probable continuation',
          'It disables the model\'s creativity entirely',
          'It translates the answer',
        ],
        answer: 1,
        explain:
          'An LLM predicts likely continuations. With relevant evidence in the context, the most probable answer is one that uses that evidence — shifting probability away from invented facts.',
      },
    ],
  },
}
