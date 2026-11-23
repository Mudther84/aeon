import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin-dashboard'

export const metadata: Metadata = { title: 'Admin workspace | Form & Flora', description: 'Manage Form & Flora products and projects.' }

export default function AdminPage() { return <AdminDashboard /> }
