import type { Metadata } from 'next'
import { AuthScreen } from '@/components/auth-screen'

export const metadata: Metadata = { title: 'Create account | Form & Flora', description: 'Create a Form & Flora account for a more personal skincare routine.' }

export default function SignupPage() { return <AuthScreen mode="signup" /> }
