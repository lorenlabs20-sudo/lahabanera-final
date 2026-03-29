"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, Calendar, Users, Mail, Phone, MessageSquare, Loader2 } from "lucide-react"
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
  const reservaId = params.id as string

  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: "confirmar" | "cancelar" | null }>({
    open: false,
    action: null,
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

    const nuevoEstado = actionDialog.action === "confirmar" ? "confirmada" : "cancelada"

    try {
      const res = await fetch(`/api/reservas/${reserva.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (res.ok) {
        fetchReserva()
        setActionDialog({ open: false, action: null })
      }
    } catch (error) {
      console.error("Error updating reserva:", error)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 text-base px-4 py-1"
          >
            Pendiente
          </Badge>
        )
      case "confirmada":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300 text-base px-4 py-1"
          >
            Confirmada
          </Badge>
        )
      case "cancelada":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300 text-base px-4 py-1"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/reservas")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#3D2314]">Detalle de Reserva</h1>
          <p className="text-muted-foreground">Informacion completa de la reserva</p>
        </div>
        <div>{getEstadoBadge(reserva.estado)}</div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#3D2314]">Informacion del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nombre */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium text-[#3D2314] text-lg">{reserva.nombre}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-[#3D2314]">
                  <a href={`mailto:${reserva.email}`} className="hover:underline">
                    {reserva.email}
                  </a>
                </p>
              </div>
            </div>

            {/* Telefono */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefono</p>
                <p className="font-medium text-[#3D2314]">
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
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Visita</p>
                <p className="font-medium text-[#3D2314] text-lg">{reserva.fecha}</p>
              </div>
            </div>

            {/* Personas */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Numero de Personas</p>
                <p className="font-medium text-[#3D2314] text-lg">{reserva.personas} persona{reserva.personas !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Comentarios */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF8F0] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Comentarios</p>
                <p className="font-medium text-[#3D2314]">
                  {reserva.comentarios || (
                    <span className="text-muted-foreground italic">Sin comentarios</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#3D2314]">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(isPendiente || isCancelada) && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setActionDialog({ open: true, action: "confirmar" })}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Reserva
                </Button>
              )}
              {(isPendiente || isConfirmada) && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setActionDialog({ open: true, action: "cancelar" })}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Reserva
                </Button>
              )}
              {isConfirmada && (
                <p className="text-sm text-muted-foreground text-center">
                  Esta reserva ha sido confirmada
                </p>
              )}
              {isCancelada && (
                <p className="text-sm text-muted-foreground text-center">
                  Esta reserva ha sido cancelada
                </p>
              )}
            </CardContent>
          </Card>

          {/* Timestamps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#3D2314]">Historial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Creada</p>
                <p className="text-sm font-medium">{formatDate(reserva.creadoEn)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ultima actualizacion</p>
                <p className="text-sm font-medium">{formatDate(reserva.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm/Cancel Dialog */}
      <AlertDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, action: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "confirmar" ? "Confirmar Reserva" : "Cancelar Reserva"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "confirmar"
                ? `Esta seguro que desea confirmar la reserva de "${reserva.nombre}" para el ${reserva.fecha}?`
                : `Esta seguro que desea cancelar la reserva de "${reserva.nombre}" para el ${reserva.fecha}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateEstado}
              className={
                actionDialog.action === "confirmar"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-destructive text-white hover:bg-destructive/90"
              }
            >
              {actionDialog.action === "confirmar" ? "Confirmar" : "Cancelar Reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
