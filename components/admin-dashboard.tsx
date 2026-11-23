'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, ArrowRight, Box, BriefcaseBusiness, Check, CircleAlert, Layers3, LogOut, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react'

type User = { id: string; email: string; name: string; role: 'USER' | 'ADMIN' }
type Product = { id: string; name: string; category: string; price: number; oldPrice: number | null; rating: number | null; image: string; tag: string | null; description: string }
type Project = { id: string; name: string; clientName: string; owner: string; status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED'; description: string; startDate: string | null; dueDate: string | null }
type ProductForm = { name: string; category: string; price: string; oldPrice: string; rating: string; image: string; tag: string; description: string }
type ProjectForm = { name: string; clientName: string; owner: string; status: Project['status']; description: string; startDate: string; dueDate: string }
const blankProduct: ProductForm = { name: '', category: 'Cleansers', price: '', oldPrice: '', rating: '4.8', image: '', tag: '', description: '' }
const blankProject: ProjectForm = { name: '', clientName: '', owner: '', status: 'PLANNING', description: '', startDate: '', dueDate: '' }
const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' })
  const result = await response.json().catch(() => null)
  if (!response.ok) throw new Error(result?.detail ?? result?.message ?? 'Could not connect to the service.')
  return result as T
}
const statusLabel: Record<Project['status'], string> = { PLANNING: 'Planning', IN_PROGRESS: 'In progress', ON_HOLD: 'On hold', COMPLETED: 'Completed' }

export function AdminDashboard() {
  const router = useRouter()
  const [section, setSection] = useState<'products' | 'projects'>('products')
  const [productForm, setProductForm] = useState<ProductForm>(blankProduct)
  const [projectForm, setProjectForm] = useState<ProjectForm>(blankProject)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const { data: user, error: authError, isLoading: authLoading } = useSWR<User>('/api/backend/auth/me', fetcher)
  const { data: products = [], error: productError, isLoading: productsLoading, mutate: refreshProducts } = useSWR<Product[]>('/api/backend/products', fetcher)
  const { data: projects = [], error: projectError, isLoading: projectsLoading, mutate: refreshProjects } = useSWR<Project[]>('/api/backend/projects', fetcher)

  async function request<T = unknown>(url: string, method: string, body?: unknown): Promise<T> {
    const response = await fetch(url, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
    if (!response.ok) {
      const result = await response.json().catch(() => null)
      throw new Error(result?.detail ?? result?.message ?? 'The request could not be completed.')
    }
    return response.status === 204 ? undefined as T : response.json()
  }

  function startProduct(product?: Product) {
    setErrorMessage('')
    setEditingProduct(product?.id ?? '')
    setProductForm(product ? { name: product.name, category: product.category, price: String(product.price), oldPrice: product.oldPrice == null ? '' : String(product.oldPrice), rating: product.rating == null ? '' : String(product.rating), image: product.image, tag: product.tag ?? '', description: product.description } : blankProduct)
  }
  function startProject(project?: Project) {
    setErrorMessage('')
    setEditingProject(project?.id ?? '')
    setProjectForm(project ? { name: project.name, clientName: project.clientName, owner: project.owner, status: project.status, description: project.description, startDate: project.startDate ?? '', dueDate: project.dueDate ?? '' } : blankProject)
  }
  function closeForms() { setEditingProduct(null); setEditingProject(null); setErrorMessage('') }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setErrorMessage('')
    const body = { ...productForm, price: Number(productForm.price), oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null, rating: productForm.rating ? Number(productForm.rating) : null, tag: productForm.tag || null }
    try {
      await request(`/api/backend/products${editingProduct ? `/${editingProduct}` : ''}`, editingProduct ? 'PUT' : 'POST', body)
      await refreshProducts(); closeForms(); setNotice(editingProduct ? 'Product updated.' : 'Product created.')
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Could not save product.') }
    finally { setSaving(false) }
  }
  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setErrorMessage('')
    const body = { ...projectForm, startDate: projectForm.startDate || null, dueDate: projectForm.dueDate || null }
    try {
      await request(`/api/backend/projects${editingProject ? `/${editingProject}` : ''}`, editingProject ? 'PUT' : 'POST', body)
      await refreshProjects(); closeForms(); setNotice(editingProject ? 'Project updated.' : 'Project created.')
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Could not save project.') }
    finally { setSaving(false) }
  }
  async function deleteRecord(kind: 'products' | 'projects', id: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return
    setErrorMessage('')
    try {
      await request(`/api/backend/${kind}/${id}`, 'DELETE')
      if (kind === 'products') await refreshProducts(); else await refreshProjects()
      setNotice(`${kind === 'products' ? 'Product' : 'Project'} deleted.`)
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Could not delete record.') }
  }
  async function signOut() {
    await request('/api/backend/auth/logout', 'POST').catch(() => undefined)
    router.push('/login'); router.refresh()
  }

  if (authLoading) return <main className="admin-loading"><div className="auth-spinner" /> Checking your account…</main>
  if (authError || !user) return <main className="admin-access"><div className="access-card"><span className="brand-mark">f.</span><h1>Sign in to continue.</h1><p>Your session may have expired. Sign in to return to your dashboard.</p><Link className="button-dark" href="/login">Go to sign in <ArrowRight size={15} /></Link></div></main>
  if (user.role !== 'ADMIN') return <main className="admin-access"><div className="access-card"><ShieldCheck size={30} /><h1>Admin access only.</h1><p>This account does not have permission to manage the store.</p><Link className="text-link" href="/">Back to the shop <ArrowRight size={14} /></Link></div></main>

  const visibleProducts = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase()))
  const visibleProjects = projects.filter((project) => `${project.name} ${project.clientName} ${project.owner}`.toLowerCase().includes(search.toLowerCase()))
  const activeProjects = projects.filter((project) => project.status === 'IN_PROGRESS').length

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/"><span className="brand-mark">f.</span><span>form <i>&</i> flora</span></Link>
        <span className="admin-label">WORKSPACE</span>
        <nav className="admin-nav" aria-label="Admin sections">
          <button className={section === 'products' ? 'active' : ''} onClick={() => { setSection('products'); setSearch(''); closeForms() }}><Box size={17} /> Products <span>{products.length}</span></button>
          <button className={section === 'projects' ? 'active' : ''} onClick={() => { setSection('projects'); setSearch(''); closeForms() }}><BriefcaseBusiness size={17} /> Projects <span>{projects.length}</span></button>
        </nav>
        <div className="sidebar-note"><Layers3 size={17} /><span>One thoughtful place for everything you make.</span></div>
        <div className="admin-profile"><div className="profile-monogram">{user.name.slice(0, 1).toUpperCase()}</div><div><b>{user.name}</b><small>{user.email}</small></div><button aria-label="Sign out" title="Sign out" onClick={signOut}><LogOut size={16} /></button></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><Link href="/" className="store-link"><ArrowLeft size={14} /> View storefront</Link><span className="admin-role"><ShieldCheck size={14} /> Administrator</span></header>
        <div className="admin-content">
          <div className="admin-heading"><div><span className="eyebrow">YOUR LITTLE CORNER OF THE INTERNET</span><h1>{section === 'products' ? <>The <em>good things.</em></> : <>Things in <em>progress.</em></>}</h1><p>{section === 'products' ? 'Thoughtful products, all in one place.' : 'Keep your projects moving, one good step at a time.'}</p></div><button className="button-dark admin-create" onClick={() => section === 'products' ? startProduct() : startProject()}><Plus size={16} /> Add {section === 'products' ? 'product' : 'project'}</button></div>

          <div className="admin-stats"><article><span>{section === 'products' ? 'LIVE PRODUCTS' : 'ALL PROJECTS'}</span><strong>{section === 'products' ? products.length : projects.length}</strong><small>Managed in one place</small></article><article><span>{section === 'products' ? 'COLLECTIONS' : 'IN PROGRESS'}</span><strong>{section === 'products' ? new Set(products.map((product) => product.category)).size : activeProjects}</strong><small>{section === 'products' ? 'Product categories' : 'Moving forward today'}</small></article><article><span>YOUR ACCESS</span><strong className="admin-stat-access">Admin</strong><small>Full management access</small></article></div>

          {notice && <div className="admin-notice" role="status"><Check size={15} /> {notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
          {errorMessage && <div className="admin-error" role="alert"><CircleAlert size={16} /> {errorMessage}</div>}

          <div className="admin-table-header"><div><h2>{section === 'products' ? 'Product list' : 'Project list'}</h2><span>{section === 'products' ? `${products.length} items` : `${projects.length} items`}</span></div><label className="admin-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Find ${section}…`} aria-label={`Search ${section}`} /></label></div>

          {section === 'products' ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>RATING</th><th aria-label="Actions" /></tr></thead><tbody>{productError ? <tr><td colSpan={5} className="table-message">Could not load products. Check the catalog service connection.</td></tr> : productsLoading ? <tr><td colSpan={5} className="table-message">Gathering your good things…</td></tr> : visibleProducts.length === 0 ? <tr><td colSpan={5} className="table-message">No products yet. Add one to get started.</td></tr> : visibleProducts.map((product) => <tr key={product.id}><td><div className="table-product"><img src={`https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=120&q=70`} alt="" /><span><b>{product.name}</b><small>{product.tag || 'Everyday care'}</small></span></div></td><td>{product.category}</td><td>${Number(product.price).toFixed(2)}</td><td><span className="rating-dot">★</span> {product.rating ?? '—'}</td><td><div className="table-actions"><button onClick={() => startProduct(product)} aria-label={`Edit ${product.name}`} title="Edit"><Pencil size={15} /></button><button onClick={() => deleteRecord('products', product.id, product.name)} aria-label={`Delete ${product.name}`} title="Delete"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>PROJECT</th><th>CLIENT</th><th>OWNER</th><th>STATUS</th><th aria-label="Actions" /></tr></thead><tbody>{projectError ? <tr><td colSpan={5} className="table-message">Could not load projects. Check the projects service connection.</td></tr> : projectsLoading ? <tr><td colSpan={5} className="table-message">Gathering your projects…</td></tr> : visibleProjects.length === 0 ? <tr><td colSpan={5} className="table-message">No projects yet. Add one to get started.</td></tr> : visibleProjects.map((project) => <tr key={project.id}><td><div className="project-table-name"><b>{project.name}</b><small>{project.dueDate ? `Due ${project.dueDate}` : 'No due date'}</small></div></td><td>{project.clientName}</td><td>{project.owner}</td><td><span className={`project-status status-${project.status.toLowerCase()}`}>{statusLabel[project.status]}</span></td><td><div className="table-actions"><button onClick={() => startProject(project)} aria-label={`Edit ${project.name}`} title="Edit"><Pencil size={15} /></button><button onClick={() => deleteRecord('projects', project.id, project.name)} aria-label={`Delete ${project.name}`} title="Delete"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
          <div className="admin-bottom-note"><span>FORM & FLORA ADMIN</span><span>Small details. Good things.</span></div>
        </div>
      </section>

      {editingProduct !== null || editingProject !== null ? <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForms() }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title"><header><div><span className="eyebrow">A THOUGHTFUL DETAIL</span><h2 id="admin-modal-title">{editingProduct !== null ? (editingProduct ? 'Edit product' : 'Add a product') : (editingProject ? 'Edit project' : 'Add a project')}</h2></div><button onClick={closeForms} aria-label="Close form"><X size={19} /></button></header>
        {editingProduct !== null ? <form className="admin-record-form" onSubmit={saveProduct}><label>Product name<input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required maxLength={120} /></label><div className="admin-form-grid"><label>Category<select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}><option>Cleansers</option><option>Serums</option><option>Moisturizers</option><option>Treatments</option></select></label><label>Tag<input value={productForm.tag} onChange={(event) => setProductForm({ ...productForm, tag: event.target.value })} maxLength={40} /></label><label>Price ($)<input type="number" min="0.01" step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required /></label><label>Compare-at ($)<input type="number" min="0.01" step="0.01" value={productForm.oldPrice} onChange={(event) => setProductForm({ ...productForm, oldPrice: event.target.value })} /></label><label>Rating<input type="number" min="0" max="5" step="0.1" value={productForm.rating} onChange={(event) => setProductForm({ ...productForm, rating: event.target.value })} /></label><label>Image ID<input value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} placeholder="photo-… (Unsplash ID)" required maxLength={500} /></label></div><label>Description<textarea rows={3} value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required maxLength={1000} /></label><footer><button type="button" className="admin-cancel" onClick={closeForms}>Cancel</button><button type="submit" className="button-dark" disabled={saving}>{saving ? 'Saving…' : 'Save product'} <ArrowRight size={14} /></button></footer></form> : <form className="admin-record-form" onSubmit={saveProject}><label>Project name<input value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} required maxLength={140} /></label><div className="admin-form-grid"><label>Client<input value={projectForm.clientName} onChange={(event) => setProjectForm({ ...projectForm, clientName: event.target.value })} required maxLength={120} /></label><label>Owner<input value={projectForm.owner} onChange={(event) => setProjectForm({ ...projectForm, owner: event.target.value })} required maxLength={120} /></label><label>Status<select value={projectForm.status} onChange={(event) => setProjectForm({ ...projectForm, status: event.target.value as Project['status'] })}><option value="PLANNING">Planning</option><option value="IN_PROGRESS">In progress</option><option value="ON_HOLD">On hold</option><option value="COMPLETED">Completed</option></select></label><label>Start date<input type="date" value={projectForm.startDate} onChange={(event) => setProjectForm({ ...projectForm, startDate: event.target.value })} /></label><label>Due date<input type="date" value={projectForm.dueDate} onChange={(event) => setProjectForm({ ...projectForm, dueDate: event.target.value })} /></label></div><label>Description<textarea rows={4} value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} required maxLength={1500} /></label><footer><button type="button" className="admin-cancel" onClick={closeForms}>Cancel</button><button type="submit" className="button-dark" disabled={saving}>{saving ? 'Saving…' : 'Save project'} <ArrowRight size={14} /></button></footer></form>}
      </section></div> : null}
    </main>
  )
}
