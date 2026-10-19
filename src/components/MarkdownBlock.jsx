import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Renders a raw markdown string (imported from /docs) with GitHub-flavored markdown.
// Links open in a new tab; that's the only customization.
export default function MarkdownBlock({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
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
