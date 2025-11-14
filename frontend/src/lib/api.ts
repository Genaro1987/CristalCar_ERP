// Helper para chamadas à API
// Como a API está no mesmo domínio, não precisa de URL externa

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  return fetch(`/api${endpoint}`, {
    ...options,
    headers,
  })
}

export async function apiGet(endpoint: string) {
  const response = await apiCall(endpoint, { method: 'GET' })
  return response.json()
}

export async function apiPost(endpoint: string, data?: any) {
  const response = await apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function apiPut(endpoint: string, data?: any) {
  const response = await apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function apiDelete(endpoint: string) {
  const response = await apiCall(endpoint, { method: 'DELETE' })
  return response.ok
}
