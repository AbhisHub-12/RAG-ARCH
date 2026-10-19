// Renders a workflow's arrows, each explained: step number, from → to, what it carries,
// and why. Reuses the connections-breakdown styling. Neat, numbered, easy to scan.
export default function FlowConnections({ edges, tone = 'retrieve' }) {
  if (!edges || edges.length === 0) return null
  return (
    <div className="conns flow-conns">
      <h3 className="block-title">How the workflow connects — every arrow explained</h3>
      <div className={`conn-group conn-group--${tone}`}>
        <ul className="conn-list">
          {edges.map((e, i) => (
            <li key={`${e.from}-${e.to}`} className="conn-row">
              <span className="conn-edge">
                <span className="conn-num">{i + 1}</span>
                <span className="conn-node">{e.from}</span>
                <span className="conn-arrow">→</span>
                <span className="conn-node">{e.to}</span>
              </span>
              <span className="conn-carries">carries: {e.carries}</span>
              <span className="conn-why">{e.why}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
