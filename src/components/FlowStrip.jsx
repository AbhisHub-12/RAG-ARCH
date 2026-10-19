// A clean, horizontal "boxes + arrows" flow strip — a tidy replacement for ASCII-art
// diagrams. Wraps gracefully on small screens.
export default function FlowStrip({ title, note, tone = 'ingest', steps }) {
  return (
    <div className={`flow flow--${tone}`}>
      {(title || note) && (
        <div className="flow-head">
          {title && <span className="flow-title">{title}</span>}
          {note && <span className="flow-note">{note}</span>}
        </div>
      )}
      <ol className="flow-steps">
        {steps.map((s, i) => (
          <li key={s.label} className="flow-item-wrap">
            <div className="flow-item">
              <span className="flow-item-label">{s.label}</span>
              {s.sub && <span className="flow-item-sub">{s.sub}</span>}
            </div>
            {i < steps.length - 1 && <span className="flow-sep" aria-hidden="true">→</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}
