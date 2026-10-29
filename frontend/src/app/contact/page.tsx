import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/forms/ContactForm";
import { AboutSection } from "@/components/sections/AboutSection";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/ui/Hero";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Send the Faith Explorers team a question or message.",
};

export default function ContactPage() {
  return (
    <>
      <Hero image="/images/hoe-may-7.jpg" />

      <AboutSection image="/images/hoe-may-12.jpg" title="How we can help?">
        <p>
          Can&apos;t find what you&apos;re looking for on our site? Please fill in the form below to
          ask us any questions and we&apos;ll get back to you as soon as possible.
        </p>
      </AboutSection>

      <section className="about container">
        <div className="contact-container content" data-aos="zoom-in-up">
          <h2 className="h2">Contact Us</h2>
          <ContactForm />
        </div>
        <div className="video-container" data-aos="fade-right">
          <Image src="/images/hoe-may-76.jpg" className="image" alt="" width={800} height={530} />
        </div>
      </section>

      <Faq />
    </>
  );
}
