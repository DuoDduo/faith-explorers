"use client";

import Image from "next/image";
import { useState } from "react";

/** One FAQ entry; native <details> so it works before JavaScript loads. */
export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span className="faq-title">{question}</span>
        <Image
          src={open ? "/images/minus.svg" : "/images/plus.svg"}
          className="expand-icon"
          alt=""
          width={24}
          height={24}
        />
      </summary>
      <div className="faq-content">{answer}</div>
    </details>
  );
}
