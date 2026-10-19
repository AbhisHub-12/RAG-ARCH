import { motion } from 'framer-motion'

// A standard content section: anchored, animated into view, with an optional kicker + title.
export default function Section({ id, kicker, title, children, className = '' }) {
  return (
    <section id={id} className={`section ${className}`}>
      <motion.div
        className="section-inner"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {(kicker || title) && (
          <header className="section-head">
            {kicker && <span className="kicker">{kicker}</span>}
            {title && <h2 className="section-title">{title}</h2>}
          </header>
        )}
        {children}
      </motion.div>
    </section>
  )
}
