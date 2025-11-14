import Head from 'next/head'
import { useEffect, useState } from 'react'

interface Customer {
  id: string
  name: string
  email: string
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`)
        if (!response.ok) {
          throw new Error('Falha ao consultar clientes')
        }
        const data = await response.json()
        setCustomers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado')
      } finally {
        setLoading(false)
      }
    }

    void loadCustomers()
  }, [])

  return (
    <>
      <Head>
        <title>CristalCar ERP</title>
        <meta name="description" content="Painel integrado com Turso" />
      </Head>
      <main style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <section>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>CristalCar ERP</h1>
          <p style={{ maxWidth: '540px', opacity: 0.8 }}>
            Frontend pronto para deploy na Vercel consumindo a API hospedada no GitHub Actions e conectada ao Turso.
          </p>
        </section>

        <section style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Clientes</h2>
            <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
              API: {process.env.NEXT_PUBLIC_API_URL}
            </span>
          </header>

          {loading && <p>Carregando clientes...</p>}
          {error && <p style={{ color: '#f87171' }}>{error}</p>}

          {!loading && !error && (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1.5rem' }}>
              {customers.length === 0 && (
                <li style={{ opacity: 0.7 }}>Nenhum cliente encontrado ainda.</li>
              )}
              {customers.map((customer) => (
                <li
                  key={customer.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    marginBottom: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.8)'
                  }}
                >
                  <strong>{customer.name}</strong>
                  <p style={{ margin: '0.25rem 0 0', opacity: 0.8 }}>{customer.email}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
