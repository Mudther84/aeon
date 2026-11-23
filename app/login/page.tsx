import type { Metadata } from 'next'
import { AuthScreen } from '@/components/auth-screen'

export const metadata: Metadata = { title: 'Sign in | Form & Flora', description: 'Sign in to your Form & Flora account.' }

export default function LoginPage() { return <AuthScreen mode="login" /> }
