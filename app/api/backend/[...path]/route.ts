import { NextRequest } from 'next/server'

const gateway = process.env.BACKEND_GATEWAY_URL ?? 'http://localhost:8080'
type RouteContext = { params: Promise<{ path: string[] }> }

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const url = new URL(`${gateway}/${path.map(encodeURIComponent).join('/')}`)
  url.search = request.nextUrl.search
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('content-length')
  const hasBody = !['GET', 'HEAD'].includes(request.method)
  const backendResponse = await fetch(url, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: 'no-store',
    redirect: 'manual',
  })
  const responseHeaders = new Headers(backendResponse.headers)
  responseHeaders.delete('transfer-encoding')
  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  })
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE }
