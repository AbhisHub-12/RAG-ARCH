import { connectionGroups } from '../data/connections.js'

// "Follow the data" — a structured breakdown of every connection in the architecture:
// source -> target, what travels on it, and why the connection exists.
export default function Connections() {
  return (
    <div className="conns">
      <h3 className="block-title">Follow the data: every connection explained</h3>
      <p className="section-lead">
        An architecture is really about the <strong>arrows</strong> — what flows between the
        boxes, and why. Here's every connection in the diagram, grouped by phase.
      </p>

      {connectionGroups.map((group) => (
        <div key={group.phase} className={`conn-group conn-group--${group.tone}`}>
          <h4 className="conn-phase">{group.phase}</h4>
          <ul className="conn-list">
            {group.edges.map((e) => (
              <li key={`${e.from}-${e.to}`} className="conn-row">
                <span className="conn-edge">
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
      ))}
    </div>
  )
}
