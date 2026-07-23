import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ErrorMessage } from '../components/ErrorMessage'
import { useAuth } from '../context/useAuth'
import { getApiError } from '../utils/getApiError'

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/products" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts.shift() ?? ''
    const lastName = nameParts.join(' ') || firstName

    setIsLoading(true)
    try {
      const successMessage = await register({
        firstName,
        lastName,
        email: email.trim(),
        password,
        confirmPassword,
      })
      navigate('/login', { replace: true, state: { successMessage } })
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to create your account.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Join us</p>
        <h1>Create an account</h1>
        <p className="muted">Enter your details to get started.</p>
        {error && <ErrorMessage message={error} />}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full name</label>
          <input id="register-name" type="text" autoComplete="name" required
            value={name} onChange={(event) => setName(event.target.value)} />

          <label htmlFor="register-email">Email address</label>
          <input id="register-email" type="email" autoComplete="email" required
            value={email} onChange={(event) => setEmail(event.target.value)} />

          <label htmlFor="register-password">Password</label>
          <input id="register-password" type="password" autoComplete="new-password" required minLength={6}
            value={password} onChange={(event) => setPassword(event.target.value)} />

          <label htmlFor="register-confirm-password">Confirm password</label>
          <input id="register-confirm-password" type="password" autoComplete="new-password" required minLength={6}
            value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </section>
  )
}
