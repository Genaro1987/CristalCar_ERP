"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Download } from "lucide-react"
import { toast } from "sonner"

interface Conta {
  id: string
  codigo: string
  descricao: string
  tipo: 'RECEITA' | 'DESPESA'
  nivel: number
  consideraResultado: boolean
  tipoGasto?: string
  usaObjetivo: boolean
  ativo: boolean
}

export default function PlanoContasPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    tipo: 'RECEITA',
    nivel: 1,
    consideraResultado: true,
    tipoGasto: '',
    usaObjetivo: false
  })

  useEffect(() => {
    fetchContas()
  }, [])

  const fetchContas = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/plano-contas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContas(data)
      }
    } catch (error) {
      toast.error('Erro ao carregar contas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const token = localStorage.getItem('token')

      const response = await fetch(`${apiUrl}/api/plano-contas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Conta criada com sucesso!')
        setDialogOpen(false)
        fetchContas()
        setFormData({
          codigo: '',
          descricao: '',
          tipo: 'RECEITA',
          nivel: 1,
          consideraResultado: true,
          tipoGasto: '',
          usaObjetivo: false
        })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao criar conta')
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const exportarExcel = () => {
    toast.info('Exportação para Excel será implementada')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plano de Contas</h1>
          <p className="text-gray-500">Gerencie as contas de receita e despesa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="mr-2 h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Conta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="Ex: 1.1.01.001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nível</Label>
                    <Select
                      value={formData.nivel.toString()}
                      onValueChange={(value) => setFormData({ ...formData, nivel: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            Nível {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição da conta"
                    required
                  />
                </div>

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
                        <SelectItem value="RECEITA">Receita</SelectItem>
                        <SelectItem value="DESPESA">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.tipo === 'DESPESA' && (
                    <div className="space-y-2">
                      <Label htmlFor="tipoGasto">Tipo de Gasto</Label>
                      <Select
                        value={formData.tipoGasto}
                        onValueChange={(value) => setFormData({ ...formData, tipoGasto: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXO">Fixo</SelectItem>
                          <SelectItem value="VARIAVEL">Variável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
          <CardTitle>Lista de Contas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Tipo Gasto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : contas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Nenhuma conta cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                contas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-mono">{conta.codigo}</TableCell>
                    <TableCell>{conta.descricao}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        conta.tipo === 'RECEITA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {conta.tipo}
                      </span>
                    </TableCell>
                    <TableCell>Nível {conta.nivel}</TableCell>
                    <TableCell>{conta.tipoGasto || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        conta.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conta.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
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
