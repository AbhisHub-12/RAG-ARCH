import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

// Renders a raw markdown string (imported from /docs) with GitHub-flavored markdown.
// Pass `raw` to allow embedded HTML (e.g. <details> collapsibles in the Q&A pages).
// Links open in a new tab.
export default function MarkdownBlock({ children, raw = false }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={raw ? [rehypeRaw] : []}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
