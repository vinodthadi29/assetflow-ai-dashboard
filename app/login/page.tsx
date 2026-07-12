'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    const success = await login(email, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError(authError || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a2332] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">AF</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">AssetFlow AI</h1>
          <p className="text-muted-foreground">Enterprise Asset Management</p>
        </div>

        <div className="bg-card border border-border/30 rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Sign In</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                  {error.includes('Database') || error.includes('DATABASE_URL') && (
                    <div className="mt-3 text-xs text-destructive/80">
                      <p className="font-semibold mb-1">Database Setup Required:</p>
                      <p>1. Set DATABASE_URL in your project settings</p>
                      <p>2. Run: pnpm prisma migrate deploy</p>
                      <p>3. Refresh and try again</p>
                    </div>
                  )}
                  {!error.includes('Database') && error.includes('Account locked') && (
                    <div className="mt-2 text-xs text-destructive/80">
                      Account temporarily locked. Try again in 30 minutes.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg bg-background border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="bg-background/50 border border-border/30 rounded-lg p-4 space-y-2 text-sm">
            <p className="font-medium text-foreground">Demo Credentials:</p>
            <p className="text-muted-foreground">
              Email: <code className="text-accent">admin@assetflow.com</code>
            </p>
            <p className="text-muted-foreground">
              Password: <code className="text-accent">Admin123456</code>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:text-accent transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 AssetFlow AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
