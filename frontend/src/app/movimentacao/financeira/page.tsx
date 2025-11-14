"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Download, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Movimentacao {
  id: string
  tipo: 'ENTRADA' | 'SAIDA'
  descricao: string
  valor: number
  dataMovimento: string
  status: string
}

export default function MovimentacaoFinanceiraPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'ENTRADA',
    descricao: '',
    contaId: '',
    valor: '',
    dataMovimento: new Date().toISOString().split('T')[0],
    status: 'PAGO'
  })

  useEffect(() => {
    fetchMovimentacoes()
  }, [])

  const fetchMovimentacoes = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch('/api/movimentacoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMovimentacoes(data.map((item: any) => item.movimentacao))
      }
    } catch (error) {
      toast.error('Erro ao carregar movimentações')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch('/api/movimentacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          contaId: 'temp-id', // Temporário até ter integração com plano de contas
          valor: parseFloat(formData.valor)
        })
      })

      if (response.ok) {
        toast.success('Movimentação criada com sucesso!')
        setDialogOpen(false)
        fetchMovimentacoes()
        setFormData({
          tipo: 'ENTRADA',
          descricao: '',
          contaId: '',
          valor: '',
          dataMovimento: new Date().toISOString().split('T')[0],
          status: 'PAGO'
        })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao criar movimentação')
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movimentação Financeira</h1>
          <p className="text-gray-500">Registre entradas e saídas financeiras</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRADA">
                          <span className="flex items-center">
                            <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                            Entrada
                          </span>
                        </SelectItem>
                        <SelectItem value="SAIDA">
                          <span className="flex items-center">
                            <TrendingDown className="mr-2 h-4 w-4 text-red-600" />
                            Saída
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição da movimentação"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataMovimento">Data</Label>
                    <Input
                      id="dataMovimento"
                      type="date"
                      value={formData.dataMovimento}
                      onChange={(e) => setFormData({ ...formData, dataMovimento: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAGO">Pago</SelectItem>
                        <SelectItem value="PENDENTE">Pendente</SelectItem>
                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
                    Salvar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : movimentacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Nenhuma movimentação registrada
                  </TableCell>
                </TableRow>
              ) : (
                movimentacoes.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>{formatDate(mov.dataMovimento)}</TableCell>
                    <TableCell>
                      {mov.tipo === 'ENTRADA' ? (
                        <span className="flex items-center text-green-600">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Entrada
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <TrendingDown className="mr-2 h-4 w-4" />
                          Saída
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{mov.descricao}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={mov.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}>
                        {mov.tipo === 'ENTRADA' ? '+' : '-'} {formatCurrency(mov.valor)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        mov.status === 'PAGO' ? 'bg-green-100 text-green-800' :
                        mov.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {mov.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
