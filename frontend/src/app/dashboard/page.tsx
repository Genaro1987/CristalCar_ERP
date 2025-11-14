"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  // Dados de exemplo - substituir por dados reais da API
  const stats = [
    {
      title: "Receitas do Mês",
      value: 125430.50,
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Despesas do Mês",
      value: 78230.25,
      change: "+8.2%",
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Saldo do Mês",
      value: 47200.25,
      change: "+18.3%",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Movimentações",
      value: 234,
      change: "+5",
      icon: Activity,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do seu negócio</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof stat.value === 'number' && stat.title.includes('R$') || stat.title.includes('Receitas') || stat.title.includes('Despesas') || stat.title.includes('Saldo')
                    ? formatCurrency(stat.value as number)
                    : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.change} em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Receitas x Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas x Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Gráfico será implementado com Recharts
            </div>
          </CardContent>
        </Card>

        {/* Fluxo de Caixa */}
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Gráfico de fluxo de caixa
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">Movimentação {i}</p>
                  <p className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {i % 2 === 0 ? '+' : '-'} {formatCurrency(1500 * i)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
