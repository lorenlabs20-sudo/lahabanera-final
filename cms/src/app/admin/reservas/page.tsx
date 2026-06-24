"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Check, X, Calendar, Users, Mail, Phone, Trash2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [estadoFilter, setEstadoFilter] = useState<string>("todas")
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reserva: Reserva | null;
    action: "confirmar" | "cancelar" | null;
    isLoading?: boolean;
  }>({
    open: false,
    reserva: null,
    action: null,
    isLoading: false,
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    reserva: Reserva | null
    isLoading?: boolean
  }>({
    open: false,
    reserva: null,
    isLoading: false,
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
    const currentReserva = confirmDialog.reserva
    const currentAction = confirmDialog.action

    if (!currentReserva || !currentAction) return

    setConfirmDialog(prev => ({ ...prev, isLoading: true }))

    const nuevoEstado = currentAction === "confirmar" ? "confirmada" : "cancelada"
    const nombreReserva = currentReserva.nombre

    try {
      const res = await fetch(`/api/reservas/${currentReserva.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (res.ok) {
        await fetchReservas()
        setConfirmDialog({ open: false, reserva: null, action: null, isLoading: false })

        if (currentAction === "confirmar") {
          toast({
            title: "Reserva confirmada",
            description: `La reserva de ${nombreReserva} ha sido confirmada exitosamente.`,
          })
        } else {
          toast({
            title: "Reserva cancelada",
            description: `La reserva de ${nombreReserva} ha sido cancelada.`,
            variant: "destructive",
          })
        }
      } else {
        setConfirmDialog(prev => ({ ...prev, isLoading: false }))
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la reserva.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating reserva:", error)
      setConfirmDialog(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.reserva) return

    setDeleteDialog(prev => ({ ...prev, isLoading: true }))
    const reservaNombre = deleteDialog.reserva.nombre

    try {
      const res = await fetch(`/api/reservas/${deleteDialog.reserva.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchReservas()
        setDeleteDialog({ open: false, reserva: null, isLoading: false })
        toast({
          title: "Reserva eliminada",
          description: `La reserva de ${reservaNombre} ha sido eliminada correctamente.`,
        })
      } else {
        const error = await res.json()
        setDeleteDialog(prev => ({ ...prev, isLoading: false }))
        toast({
          title: "Error",
          description: error.error || "No se pudo eliminar la reserva.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting reserva:", error)
      setDeleteDialog(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
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
            className="bg-yellow-100 text-yellow-800 border-yellow-300 whitespace-nowrap"
          >
            Pendiente
          </Badge>
        )
      case "confirmada":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300 whitespace-nowrap"
          >
            Confirmada
          </Badge>
        )
      case "cancelada":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300 whitespace-nowrap"
          >
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline" className="whitespace-nowrap">{estado}</Badge>
    }
  }

  const columns: ColumnDef<Reserva>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium text-[#3D2314] truncate max-w-[120px] sm:max-w-none">
          {row.original.nombre}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 truncate max-w-[150px] sm:max-w-none">
          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm truncate">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Telefono",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm">{row.original.telefono || "-"}</span>
        </div>
      ),
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm whitespace-nowrap">{row.original.fecha}</span>
        </div>
      ),
    },
    {
      accessorKey: "personas",
      header: "Personas",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/reservas/${reserva.id}`)}
              title="Ver detalles"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {(isPendiente || isCancelada) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDialog({ open: true, reserva, action: "confirmar", isLoading: false })}
                title="Confirmar"
                className="text-green-600 hover:text-green-700 h-8 w-8 sm:h-9 sm:w-9"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            {(isPendiente || isConfirmada) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDialog({ open: true, reserva, action: "cancelar", isLoading: false })}
                title="Cancelar"
                className="text-red-600 hover:text-red-700 h-8 w-8 sm:h-9 sm:w-9"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialog({ open: true, reserva, isLoading: false })}
              title="Eliminar"
              className="text-gray-500 hover:text-red-600 h-8 w-8 sm:h-9 sm:w-9"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
          <p className="text-muted-foreground">Gestión de reservas de turismo rural</p>
        </div>
      </div>

      {/* Stats Cards - Responsive en columna en móvil */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="w-full">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pendientes</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{pendientesCount}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Confirmadas</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{confirmadasCount}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 sm:w-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Canceladas</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{canceladasCount}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-5 h-5 sm:w-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-[#3D2314] text-lg sm:text-xl">Lista de Reservas</CardTitle>
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
        <CardContent className="px-2 sm:px-6">
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
        onOpenChange={(open) => {
          if (!open && !confirmDialog.isLoading) {
            setConfirmDialog({ open: false, reserva: null, action: null, isLoading: false })
          }
        }}
      >
        <AlertDialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              {confirmDialog.action === "confirmar" ? "Confirmar Reserva" : "Cancelar Reserva"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {confirmDialog.action === "confirmar"
                ? `¿Está seguro que desea confirmar la reserva de "${confirmDialog.reserva?.nombre || ''}"?`
                : `¿Está seguro que desea cancelar la reserva de "${confirmDialog.reserva?.nombre || ''}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={confirmDialog.isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateEstado}
              disabled={confirmDialog.isLoading}
              className={`w-full sm:w-auto ${confirmDialog.action === "confirmar"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
                }`}
            >
              {confirmDialog.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                confirmDialog.action === "confirmar" ? "Confirmar" : "Cancelar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open && !deleteDialog.isLoading) {
            setDeleteDialog({ open: false, reserva: null, isLoading: false })
          }
        }}
      >
        <AlertDialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Eliminar Reserva</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              ¿Está seguro que desea eliminar la reserva de{" "}
              <span className="font-semibold">"{deleteDialog.reserva?.nombre}"</span>?
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={deleteDialog.isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteDialog.isLoading}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700"
            >
              {deleteDialog.isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}