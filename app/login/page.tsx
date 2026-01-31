'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

const ERROR_MESSAGE_MAP: Record<string, string> = {
  MISSING_CREDENTIALS: 'Please enter both email and password.',
  USER_NOT_FOUND: 'No account found with this email.',
  INVALID_PASSWORD: 'Incorrect password. Please try again.',
  CredentialsSignin: 'Invalid email or password.',
  default: 'Something went wrong. Please try again.',
}

/**
 * Login page component.
 * Handles user authentication using email and password.
 * Uses NextAuth `signIn` method and provides feedback on success/failure.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const res = await signIn('credentials', {
      redirect: false, // IMPORTANT: handle manually
      email,
      password,
      callbackUrl: '/dashboard',
    })

    setLoading(false)

    if (res?.error) {
      const message =
        ERROR_MESSAGE_MAP[res.error] || ERROR_MESSAGE_MAP.default
      setError(message)
      return
    }

    if (res?.ok) {
      setSuccess(true)
      // manual redirect after short delay (optional UX)
      window.location.href = res.url || '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        className="w-96 p-6 border rounded space-y-3"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-bold">Login</h1>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 p-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="text-green-700 bg-green-50 border border-green-200 p-2 rounded text-sm">
            Login successful! Redirecting...
          </div>
        )}

        <input
          className="border p-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          className="border p-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button
          className="bg-black text-white w-full py-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
