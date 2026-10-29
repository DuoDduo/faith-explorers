import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { useSubscribe } from '../api/hooks'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const subscribe = useSubscribe()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    subscribe.mutate(email, { onSuccess: () => setEmail('') })
  }

  const error =
    subscribe.error instanceof ApiError
      ? (subscribe.error.fieldErrors.email ?? subscribe.error.message)
      : subscribe.error && 'Could not subscribe right now. Please try again.'

  return (
    <form onSubmit={onSubmit} noValidate>
      <input
        type="email"
        placeholder="Enter your email"
        className="email"
        aria-label="Email address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="submit"
        value={subscribe.isPending ? 'Subscribing…' : 'Subscribe'}
        className="btn"
        disabled={subscribe.isPending}
      />
      {subscribe.isSuccess && <p role="status">{subscribe.data.detail}</p>}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </form>
  )
}
