"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Building2,
  Target,
  BarChart3,
  Settings,
  FileSpreadsheet,
  Upload,
  DollarSign,
  Receipt,
  ShoppingCart
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard"
  },
  {
    title: "Administrativo",
    icon: Users,
    items: [
      { title: "Funcionários", href: "/admin/funcionarios" },
      { title: "Usuários", href: "/admin/usuarios" },
      { title: "Importar Arquivos", href: "/admin/importar", icon: Upload }
    ]
  },
  {
    title: "Cadastros",
    icon: FileText,
    items: [
      { title: "Plano de Contas", href: "/cadastros/plano-contas", icon: FileSpreadsheet },
      { title: "Plano DRE", href: "/cadastros/plano-dre", icon: BarChart3 },
      { title: "Bancos", href: "/cadastros/bancos", icon: Building2 }
    ]
  },
  {
    title: "Movimentação",
    icon: DollarSign,
    items: [
      { title: "Financeira", href: "/movimentacao/financeira", icon: DollarSign }
    ]
  },
  {
    title: "Faturamento",
    icon: TrendingUp,
    items: [
      { title: "Notas Fiscais Venda", href: "/faturamento/notas-venda", icon: Receipt },
      { title: "Importar XML Venda", href: "/faturamento/importar-xml", icon: Upload }
    ]
  },
  {
    title: "Compras",
    icon: ShoppingCart,
    items: [
      { title: "Notas Fiscais Compra", href: "/compras/notas-compra", icon: Receipt },
      { title: "Importar XML Compra", href: "/compras/importar-xml", icon: Upload }
    ]
  },
  {
    title: "Objetivos",
    icon: Target,
    href: "/objetivos"
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    items: [
      { title: "DRE", href: "/relatorios/dre" },
      { title: "Fluxo de Caixa", href: "/relatorios/fluxo-caixa" },
      { title: "Objetivos vs Realizado", href: "/relatorios/objetivos" }
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <h1 className="text-xl font-bold text-orange-500">CristalCar ERP</h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon

          if (item.items) {
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-400">
                  <Icon className="mr-3 h-5 w-5" />
                  {item.title}
                </div>
                <div className="ml-6 space-y-1">
                  {item.items.map((subItem, subIndex) => {
                    const SubIcon = subItem.icon
                    const isActive = pathname === subItem.href

                    return (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-orange-600 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        {SubIcon && <SubIcon className="mr-3 h-4 w-4" />}
                        {subItem.title}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          }

          const isActive = pathname === item.href

          return (
            <Link
              key={index}
              href={item.href!}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
