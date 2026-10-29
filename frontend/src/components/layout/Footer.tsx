import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FOOTER_NAV, SOCIAL_LINKS } from "@/content/navigation";
import { CONTACT_INFO } from "@/content/site";

export function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="box-container">
          <div className="box" data-aos="fade-up" data-aos-delay="150">
            <Link href="/" className="logo">
              <Image src="/images/faith2.png" alt="" width={40} height={49} />
              <span aria-hidden="true">aith Explorers</span>
              <span className="sr-only">Faith Explorers</span>
            </Link>
            <p>
              We believe that the Christian faith is not just a set of beliefs, but a way of life
              that permeates every aspect of our existence. For inquiries please don&apos;t hesitate
              to contact us:
            </p>
            <div className="share">
              {SOCIAL_LINKS.map(({ label, icon, href }) =>
                href ? (
                  <a key={label} href={href} className={`fab ${icon}`} aria-label={label} />
                ) : (
                  <span key={label} className={`fab ${icon}`} aria-hidden="true" />
                ),
              )}
            </div>
          </div>

          <nav className="box contact" aria-label="Footer" data-aos="fade-up" data-aos-delay="300">
            <h2>Quick links</h2>
            {FOOTER_NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="links">
                <i className="fas fa-arrow-right" aria-hidden="true"></i> {label}
              </Link>
            ))}
          </nav>

          <div className="box" data-aos="fade-up" data-aos-delay="350">
            <h2>Contact info</h2>
            <p>
              <i className="fas fa-map" aria-hidden="true"></i> {CONTACT_INFO.address}
            </p>
            <p>
              <i className="fas fa-phone" aria-hidden="true"></i> {CONTACT_INFO.phone}
            </p>
            <p>
              <i className="fas fa-envelope" aria-hidden="true"></i> {CONTACT_INFO.email}
            </p>
          </div>

          <div className="box" data-aos="fade-up" data-aos-delay="300">
            <h2>Newsletter</h2>
            <p>Subscribe for latest updates</p>
            <NewsletterForm />
          </div>
        </div>
      </footer>

      <div className="credit">
        <p>Copyright © Faith Explorers. All rights reserved!</p>
        <p>designed by Blessing James</p>
      </div>
    </>
  );
}
