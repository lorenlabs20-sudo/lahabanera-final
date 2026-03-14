"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Check, X, Calendar, Users, Mail, Phone } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Reserva {
  id: string
  nombre: string
  email: string
  telefono: string | null
  fecha: string
  personas: number
  comentarios: string | null
  estado: string
  creadoEn: string
}

export default function ReservasPage() {
  const router = useRouter()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [estadoFilter, setEstadoFilter] = useState<string>("todas")
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; reserva: Reserva | null; action: "confirmar" | "cancelar" | null }>({
    open: false,
    reserva: null,
    action: null,
  })

  useEffect(() => {
    fetchReservas()
  }, [])

  const fetchReservas = async () => {
    try {
      const res = await fetch("/api/reservas")
      if (res.ok) {
        const data = await res.json()
        setReservas(data.reservas)
      }
    } catch (error) {
      console.error("Error fetching reservas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEstado = async () => {
    if (!confirmDialog.reserva || !confirmDialog.action) return

    const nuevoEstado = confirmDialog.action === "confirmar" ? "confirmada" : "cancelada"

    try {
      const res = await fetch(`/api/reservas/${confirmDialog.reserva.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (res.ok) {
        fetchReservas()
        setConfirmDialog({ open: false, reserva: null, action: null })
      }
    } catch (error) {
      console.error("Error updating reserva:", error)
    }
  }

  const filteredReservas = reservas.filter((r) => {
    if (estadoFilter === "todas") return true
    return r.estado === estadoFilter
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Pendiente
          </Badge>
        )
      case "confirmada":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            Confirmada
          </Badge>
        )
      case "cancelada":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const columns: ColumnDef<Reserva>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium text-[#3D2314]">{row.original.nombre}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Telefono",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{row.original.telefono || "-"}</span>
        </div>
      ),
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{row.original.fecha}</span>
        </div>
      ),
    },
    {
      accessorKey: "personas",
      header: "Personas",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{row.original.personas}</span>
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => getEstadoBadge(row.original.estado),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const reserva = row.original
        const isPendiente = reserva.estado === "pendiente"
        const isConfirmada = reserva.estado === "confirmada"
        const isCancelada = reserva.estado === "cancelada"

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/reservas/${reserva.id}`)}
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {(isPendiente || isCancelada) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDialog({ open: true, reserva, action: "confirmar" })}
                title="Confirmar"
                className="text-green-600 hover:text-green-700"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            {(isPendiente || isConfirmada) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDialog({ open: true, reserva, action: "cancelar" })}
                title="Cancelar"
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  // Calculate stats
  const pendientesCount = reservas.filter((r) => r.estado === "pendiente").length
  const confirmadasCount = reservas.filter((r) => r.estado === "confirmada").length
  const canceladasCount = reservas.filter((r) => r.estado === "cancelada").length

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2314]">Reservas</h1>
          <p className="text-muted-foreground">Gestion de reservas de turismo rural</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendientesCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">{confirmadasCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">{canceladasCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#3D2314]">Lista de Reservas</CardTitle>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="confirmada">Confirmadas</SelectItem>
                <SelectItem value="cancelada">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredReservas}
            searchKey="nombre"
            searchPlaceholder="Buscar por nombre..."
          />
        </CardContent>
      </Card>

      {/* Confirm/Cancel Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, reserva: null, action: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "confirmar" ? "Confirmar Reserva" : "Cancelar Reserva"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "confirmar"
                ? `Esta seguro que desea confirmar la reserva de "${confirmDialog.reserva?.nombre}"?`
                : `Esta seguro que desea cancelar la reserva de "${confirmDialog.reserva?.nombre}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateEstado}
              className={
                confirmDialog.action === "confirmar"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-destructive text-white hover:bg-destructive/90"
              }
            >
              {confirmDialog.action === "confirmar" ? "Confirmar" : "Cancelar Reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
