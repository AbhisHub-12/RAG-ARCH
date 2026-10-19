import { useState } from 'react'

// A self-contained knowledge check. `quiz` = { title, questions: [{q, options, answer, explain}] }
export default function Quiz({ quiz }) {
  const [picked, setPicked] = useState({}) // index -> chosen option index

  const choose = (qi, oi) => {
    if (picked[qi] != null) return // lock after first answer
    setPicked((p) => ({ ...p, [qi]: oi }))
  }

  const answered = Object.keys(picked).length
  const correct = quiz.questions.reduce(
    (n, q, qi) => n + (picked[qi] === q.answer ? 1 : 0),
    0,
  )
  const done = answered === quiz.questions.length

  return (
    <div className="quiz">
      <div className="quiz-head">
        <span className="quiz-icon">❓</span>
        <h3>{quiz.title}</h3>
        <span className="quiz-progress">
          {answered}/{quiz.questions.length}
        </span>
      </div>

      {quiz.questions.map((item, qi) => {
        const chosen = picked[qi]
        const isAnswered = chosen != null
        return (
          <div key={qi} className="quiz-q">
            <p className="quiz-prompt">{item.q}</p>
            <div className="quiz-options">
              {item.options.map((opt, oi) => {
                const isCorrect = oi === item.answer
                const state = !isAnswered
                  ? ''
                  : oi === chosen && isCorrect
                    ? 'is-correct'
                    : oi === chosen && !isCorrect
                      ? 'is-wrong'
                      : isCorrect
                        ? 'is-correct-missed'
                        : ''
                return (
                  <button
                    key={oi}
                    className={`quiz-option ${state}`}
                    onClick={() => choose(qi, oi)}
                    disabled={isAnswered}
                  >
                    <span className="quiz-marker">
                      {isAnswered && isCorrect ? '✓' : isAnswered && oi === chosen ? '✕' : String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {isAnswered && (
              <p className={`quiz-explain ${chosen === item.answer ? 'ok' : 'no'}`}>
                {chosen === item.answer ? 'Correct! ' : 'Not quite. '}
                {item.explain}
              </p>
            )}
          </div>
        )
      })}

      {done && (
        <div className="quiz-result">
          You scored <strong>{correct}/{quiz.questions.length}</strong>
          {correct === quiz.questions.length ? ' — perfect! 🎉' : ' — review the section and try again.'}
        </div>
      )}
    </div>
  )
}
