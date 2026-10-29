import { Link } from 'react-router-dom'
import { CONTACT_INFO } from '../content/site'
import { NewsletterForm } from './NewsletterForm'

const YEAR = new Date().getFullYear()

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/categories', label: 'Category' },
  { to: '/articles', label: 'Articles' },
  { to: '/contact', label: 'Contact Us' },
]

export function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="box-container">
          <div className="box" data-aos="fade-up" data-aos-delay="150">
            <Link to="/" className="logo">
              <img src="/images/faith2.png" alt="" />
              aith Explorers
            </Link>
            <p>
              We believe that the Christian faith is not just a set of beliefs, but a way of life
              that permeates every aspect of our existence. For inquiries please don't hesitate to
              contact us:
            </p>
            {/* Add the real profile URLs here once the accounts exist. */}
            <div className="share">
              <a href="#" className="fab fa-facebook-f" aria-label="Facebook"></a>
              <a href="#" className="fab fa-twitter" aria-label="Twitter"></a>
              <a href="#" className="fab fa-instagram" aria-label="Instagram"></a>
              <a href="#" className="fab fa-linkedin" aria-label="LinkedIn"></a>
            </div>
          </div>

          <div className="box contact" data-aos="fade-up" data-aos-delay="300">
            <h3>Quick links</h3>
            {LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="links">
                <i className="fas fa-arrow-right"></i> {label}
              </Link>
            ))}
          </div>

          <div className="box" data-aos="fade-up" data-aos-delay="350">
            <h3>Contact info</h3>
            <p>
              <i className="fas fa-map"></i> {CONTACT_INFO.address}
            </p>
            <p>
              <i className="fas fa-phone"></i> {CONTACT_INFO.phone}
            </p>
            <p>
              <i className="fas fa-envelope"></i> {CONTACT_INFO.email}
            </p>
          </div>

          <div className="box" data-aos="fade-up" data-aos-delay="300">
            <h3>Newsletter</h3>
            <p>Subscribe for latest updates</p>
            <NewsletterForm />
          </div>
        </div>
      </footer>

      <div className="credit">
        <p>Copyright © Faith Explorers {YEAR}. All rights reserved!</p>
        <p>designed by Blessing James</p>
      </div>
    </>
  )
}
