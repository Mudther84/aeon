'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react'

type AuthUser = { id: string; email: string; name: string; role: 'USER' | 'ADMIN' }

export function AuthScreen({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const isSignup = mode === 'signup'

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setLoading(true)
    try {
      const response = await fetch(`/api/backend/auth/${isSignup ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.detail ?? result?.message ?? 'We could not sign you in. Check your details and try again.')
      const user = result?.user as AuthUser | undefined
      router.push(user?.role === 'ADMIN' ? '/admin' : '/')
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Form & Flora skincare">
        <Link className="brand auth-brand" href="/"><span className="brand-mark">f.</span><span>form <i>&</i> flora</span></Link>
        <div className="auth-visual-copy"><span className="eyebrow"><span className="eyebrow-line" /> A LITTLE MORE CARE</span><h1>Good skin.<br /><em>Good to you.</em></h1><p>A softer kind of skincare starts with a little time for yourself.</p><div className="auth-promise"><Check size={15} /> Thoughtful essentials, made for real life</div></div>
        <div className="auth-visual-photo" role="img" aria-label="Skincare bottles on a warm stone surface" />
        <span className="auth-image-note">THE EVERYDAY EDIT&nbsp;&nbsp; · &nbsp;&nbsp;FORM & FLORA</span>
      </section>
      <section className="auth-panel">
        <Link className="auth-back" href="/"><ArrowLeft size={15} /> Back to the shop</Link>
        <div className="auth-form-wrap">
          <span className="eyebrow">{isSignup ? 'YOUR OWN LITTLE RITUAL' : 'WELCOME BACK'}</span>
          <h2>{isSignup ? <>Make yourself<br /><em>at home.</em></> : <>Good to see<br /><em>you again.</em></>}</h2>
          <p className="auth-description">{isSignup ? 'Create an account for a gentler, more personal shopping experience.' : 'Sign in to pick up right where your routine left off.'}</p>
          <form className="auth-form" onSubmit={submit}>
            {isSignup && <label htmlFor="auth-name">Your name<input id="auth-name" autoComplete="name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} required /></label>}
            <label htmlFor="auth-email">Email address<input id="auth-email" type="email" autoComplete="email" maxLength={190} value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label htmlFor="auth-password">Password<input id="auth-password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 12 : 1} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required /><small>{isSignup ? 'Use at least 12 characters.' : <Link href="/signup">New here? Create an account.</Link>}</small></label>
            {message && <div className="auth-error" role="alert">{message}</div>}
            <button className="button-dark auth-submit" type="submit" disabled={loading}>{loading ? 'One moment…' : isSignup ? 'Create your account' : 'Sign in'}{loading ? <LoaderCircle size={16} className="auth-spinner" /> : <ArrowRight size={16} />}</button>
          </form>
          <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to Form & Flora?'} <Link href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Create an account'}</Link></p>
          <p className="auth-privacy">Your details stay private and are only used to care for your account.</p>
        </div>
        <span className="auth-footer-mark">CARE THAT FEELS GOOD, EVERY DAY.</span>
      </section>
    </main>
  )
}
