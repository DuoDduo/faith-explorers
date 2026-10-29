import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { useContact } from '../api/hooks'
import type { ContactInput } from '../api/types'
import { AboutBlock } from '../components/AboutBlock'
import { Faq } from '../components/Faq'
import { Hero } from '../components/Hero'

const EMPTY: ContactInput = { name: '', email: '', message: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: ContactInput): Partial<Record<keyof ContactInput, string>> {
  const errors: Partial<Record<keyof ContactInput, string>> = {}
  if (!values.name.trim()) errors.name = 'Name is required'
  if (!EMAIL_RE.test(values.email)) errors.email = 'Invalid email address'
  if (!values.message.trim()) errors.message = 'Message is required'
  return errors
}

export function ContactPage() {
  const [values, setValues] = useState<ContactInput>(EMPTY)
  const [clientErrors, setClientErrors] = useState<ReturnType<typeof validate>>({})
  const contact = useContact()

  const serverErrors = contact.error instanceof ApiError ? contact.error.fieldErrors : {}
  const errors = { ...serverErrors, ...clientErrors }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setClientErrors(found)
    if (Object.keys(found).length > 0) return
    contact.mutate(values, { onSuccess: () => setValues(EMPTY) })
  }

  const field = (name: keyof ContactInput) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    required: true,
    'aria-invalid': Boolean(errors[name]) || undefined,
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
    onChange: (e: { target: { value: string } }) =>
      setValues((v) => ({ ...v, [name]: e.target.value })),
  })

  const fieldError = (name: keyof ContactInput) =>
    errors[name] && (
      <div className="error" id={`contact-${name}-error`}>
        {errors[name]}
      </div>
    )

  return (
    <>
      <Hero image="/images/hoe-may-7.jpg" />

      <AboutBlock image="/images/hoe-may-12.jpg" title="How we can help?">
        <p>
          Can't find what you're looking for on our site? Please fill in the form below to ask us
          any questions and we'll get back to you as soon as possible.
        </p>
      </AboutBlock>

      <section className="about container">
        <div className="contact-container content" data-aos="zoom-in-up">
          <h2 className="h2">Contact Us</h2>
          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <label htmlFor="contact-name">Name:</label>
            <input type="text" autoComplete="name" {...field('name')} />
            {fieldError('name')}

            <label htmlFor="contact-email">Email:</label>
            <input type="email" autoComplete="email" {...field('email')} />
            {fieldError('email')}

            <label htmlFor="contact-message">Message:</label>
            <textarea rows={4} {...field('message')} />
            {fieldError('message')}

            <button type="submit" disabled={contact.isPending}>
              {contact.isPending ? 'Sending…' : 'Send Message'}
            </button>
            {contact.isSuccess && (
              <p className="form-success" role="status">
                {contact.data.detail}
              </p>
            )}
            {contact.error && !Object.keys(serverErrors).length && (
              <p className="error" role="alert">
                Sorry, your message couldn't be sent. Please try again.
              </p>
            )}
          </form>
        </div>
        <div className="video-container" data-aos="fade-right">
          <img src="/images/hoe-may-76.jpg" className="image" alt="" loading="lazy" />
        </div>
      </section>

      <Faq />
    </>
  )
}
