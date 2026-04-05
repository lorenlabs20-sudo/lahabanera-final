"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, Calendar, Users, Mail, Phone, MessageSquare, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  updatedAt: string
}

export default function ReservaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const reservaId = params.id as string

  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: "confirmar" | "cancelar" | null; isLoading?: boolean }>({
    open: false,
    action: null,
    isLoading: false,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; isLoading?: boolean }>({
    open: false,
    isLoading: false,
  })

  useEffect(() => {
    fetchReserva()
  }, [reservaId])

  const fetchReserva = async () => {
    try {
      const res = await fetch(`/api/reservas/${reservaId}`)
      if (res.ok) {
        const data = await res.json()
        setReserva(data.reserva)
      } else {
        router.push("/admin/reservas")
      }
    } catch (error) {
      console.error("Error fetching reserva:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEstado = async () => {
    if (!reserva || !actionDialog.action) return

    const currentAction = actionDialog.action
    const nuevoEstado = currentAction === "confirmar" ? "confirmada" : "cancelada"
    const nombreReserva = reserva.nombre

    setActionDialog(prev => ({ ...prev, isLoading: true }))

    try {
      const res = await fetch(`/api/reservas/${reserva.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (res.ok) {
        await fetchReserva()
        setActionDialog({ open: false, action: null, isLoading: false })

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
        setActionDialog(prev => ({ ...prev, isLoading: false }))
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la reserva.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating reserva:", error)
      setActionDialog(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!reserva) return

    setDeleteDialog(prev => ({ ...prev, isLoading: true }))
    const reservaNombre = reserva.nombre

    try {
      const res = await fetch(`/api/reservas/${reserva.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Reserva eliminada",
          description: `La reserva de ${reservaNombre} ha sido eliminada correctamente.`,
        })
        router.push("/admin/reservas")
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

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm sm:text-base px-3 sm:px-4 py-1 whitespace-nowrap"
          >
            Pendiente
          </Badge>
        )
      case "confirmada":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300 text-sm sm:text-base px-3 sm:px-4 py-1 whitespace-nowrap"
          >
            Confirmada
          </Badge>
        )
      case "cancelada":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300 text-sm sm:text-base px-3 sm:px-4 py-1 whitespace-nowrap"
          >
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Reserva no encontrada</div>
      </div>
    )
  }

  const isPendiente = reserva.estado === "pendiente"
  const isConfirmada = reserva.estado === "confirmada"
  const isCancelada = reserva.estado === "cancelada"

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/reservas")}
            className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Detalle de Reserva</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Información completa de la reserva</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          {getEstadoBadge(reserva.estado)}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-[#3D2314] text-lg sm:text-xl">Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-6">
            {/* Nombre */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium text-[#3D2314] text-base sm:text-lg break-words">{reserva.nombre}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-[#3D2314] text-sm sm:text-base break-all">
                  <a href={`mailto:${reserva.email}`} className="hover:underline break-all">
                    {reserva.email}
                  </a>
                </p>
              </div>
            </div>

            {/* Telefono */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium text-[#3D2314] text-sm sm:text-base break-words">
                  {reserva.telefono ? (
                    <a href={`tel:${reserva.telefono}`} className="hover:underline">
                      {reserva.telefono}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No proporcionado</span>
                  )}
                </p>
              </div>
            </div>

            {/* Fecha */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Fecha de Visita</p>
                <p className="font-medium text-[#3D2314] text-base sm:text-lg break-words">{reserva.fecha}</p>
              </div>
            </div>

            {/* Personas */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Número de Personas</p>
                <p className="font-medium text-[#3D2314] text-base sm:text-lg break-words">
                  {reserva.personas} persona{reserva.personas !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Comentarios */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Comentarios</p>
                <p className="font-medium text-[#3D2314] text-sm sm:text-base break-words">
                  {reserva.comentarios || (
                    <span className="text-muted-foreground italic">Sin comentarios</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-[#3D2314] text-lg sm:text-xl">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 space-y-3 sm:space-y-4">
              {(isPendiente || isCancelada) && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                  onClick={() => setActionDialog({ open: true, action: "confirmar", isLoading: false })}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Reserva
                </Button>
              )}
              {(isPendiente || isConfirmada) && (
                <Button
                  variant="destructive"
                  className="w-full text-sm sm:text-base"
                  onClick={() => setActionDialog({ open: true, action: "cancelar", isLoading: false })}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Reserva
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 text-sm sm:text-base"
                onClick={() => setDeleteDialog({ open: true, isLoading: false })}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Reserva
              </Button>
              {isConfirmada && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Esta reserva ha sido confirmada
                </p>
              )}
              {isCancelada && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Esta reserva ha sido cancelada
                </p>
              )}
            </CardContent>
          </Card>

          {/* Timestamps Card */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-[#3D2314] text-lg sm:text-xl">Historial</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Creada</p>
                <p className="text-xs sm:text-sm font-medium break-words">{formatDate(reserva.creadoEn)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Última actualización</p>
                <p className="text-xs sm:text-sm font-medium break-words">{formatDate(reserva.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm/Cancel Dialog */}
      <AlertDialog
        open={actionDialog.open}
        onOpenChange={(open) => {
          if (!open && !actionDialog.isLoading) {
            setActionDialog({ open: false, action: null, isLoading: false })
          }
        }}
      >
        <AlertDialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              {actionDialog.action === "confirmar" ? "Confirmar Reserva" : "Cancelar Reserva"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm break-words">
              {actionDialog.action === "confirmar"
                ? `¿Está seguro que desea confirmar la reserva de "${reserva.nombre}" para el ${reserva.fecha}?`
                : `¿Está seguro que desea cancelar la reserva de "${reserva.nombre}" para el ${reserva.fecha}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={actionDialog.isLoading}
              className="w-full sm:w-auto"
            >
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateEstado}
              disabled={actionDialog.isLoading}
              className={`w-full sm:w-auto ${actionDialog.action === "confirmar"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
                }`}
            >
              {actionDialog.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                actionDialog.action === "confirmar" ? "Confirmar" : "Cancelar"
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
            setDeleteDialog({ open: false, isLoading: false })
          }
        }}
      >
        <AlertDialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Eliminar Reserva</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              ¿Está seguro que desea eliminar la reserva de{" "}
              <span className="font-semibold">"{reserva.nombre}"</span>?
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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