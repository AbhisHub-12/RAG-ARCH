export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark">◭</span> RAG-<strong>ARCH</strong>
          <p>Retrieve · Augment · Generate — RAG, explained from zero.</p>
        </div>

        <div className="footer-col">
          <h4>Learn more</h4>
          <ul>
            <li>
              <a href="https://github.com/hkuds/rag-anything" target="_blank" rel="noopener noreferrer">
                RAG-Anything (HKUDS) ↗
              </a>
            </li>
            <li>
              <a href="https://www.elastic.co/what-is/retrieval-augmented-generation" target="_blank" rel="noopener noreferrer">
                What is RAG? (Elastic) ↗
              </a>
            </li>
            <li>
              <a href="https://www.datacamp.com/blog/what-is-retrieval-augmented-generation-rag" target="_blank" rel="noopener noreferrer">
                RAG guide (DataCamp) ↗
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>This project</h4>
          <ul>
            <li>
              <a href="https://github.com/AbhisHub-12/RAG-ARCH" target="_blank" rel="noopener noreferrer">
                Source on GitHub ↗
              </a>
            </li>
            <li>
              <a href="https://github.com/AbhisHub-12/RAG-ARCH/tree/main/docs" target="_blank" rel="noopener noreferrer">
                Read the lessons (markdown) ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        Built as an interactive, beginner-first RAG primer · MIT licensed · Content from
        open web sources, 2026.
      </div>
    </footer>
  )
}
