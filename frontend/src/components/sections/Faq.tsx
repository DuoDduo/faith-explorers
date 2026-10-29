import { FaqItem } from "@/components/sections/FaqItem";
import { FAQS } from "@/content/site";

export function Faq() {
  return (
    <section className="faq-container" data-aos="zoom-in">
      <div className="heading">
        <h2 className="faq-heading">Frequently asked Questions</h2>
        <span>Quick Answers</span>
      </div>
      {FAQS.map((faq) => (
        <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
      ))}
    </section>
  );
}
