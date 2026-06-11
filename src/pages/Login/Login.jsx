import { useState } from 'react'
import AuthCard from '../../components/AuthCard/AuthCard'
import { login } from '../../services/authService'
import './Login.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function validateForm() {
    if (!formData.email.trim() || !formData.password) {
      return 'Email and password are required.'
    }

    if (!emailPattern.test(formData.email)) {
      return 'Enter a valid mission operator email address.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await login(formData.email.trim(), formData.password)
      localStorage.setItem('scorpio_token', response.token)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  function goToSignUp() {
    window.location.assign('/signup')
  }

  return (
    <main className="auth-page auth-page--login">
      <div className="auth-page__background" aria-hidden="true">
        <span className="auth-page__satellite-path" />
      </div>

      <AuthCard>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="operator@scorpio.space"
              autoComplete="email"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter secure passphrase"
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          {error && (
            <p className="auth-form__message auth-form__message--error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-form__button auth-form__button--primary" type="submit" disabled={isLoading}>
            {isLoading ? <span className="auth-form__loader" aria-hidden="true" /> : null}
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>

          <button className="auth-form__button auth-form__button--secondary" type="button" onClick={goToSignUp}>
            Go to Sign Up
          </button>
        </form>
      </AuthCard>
    </main>
  )
}
