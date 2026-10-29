import { useState } from 'react'
import { FAQS } from '../content/site'

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <details onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span className="faq-title">{question}</span>
        <img src={open ? '/images/minus.svg' : '/images/plus.svg'} className="expand-icon" alt="" />
      </summary>
      <div className="faq-content">{answer}</div>
    </details>
  )
}

export function Faq() {
  return (
    <section className="faq-container" data-aos="zoom-in">
      <div className="heading">
        <h2 className="faq-heading">Frequently asked Questions</h2>
        <span>Quick Answers</span>
      </div>
      {FAQS.map((faq) => (
        <FaqItem key={faq.question} {...faq} />
      ))}
    </section>
  )
}
