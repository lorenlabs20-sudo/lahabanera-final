"use client"

import { useEffect, useState } from "react"
import { useRouter, use } from "next/navigation"
import { ArrowLeft, Mail, MailOpen, Trash2, Phone, Mail as MailIcon, Calendar, User, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

interface Mensaje {
  id: string
  nombre: string
  email: string
  telefono: string | null
  asunto: string
  mensaje: string
  leido: boolean
  creadoEn: string
}

export default function MensajeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [mensaje, setMensaje] = useState<Mensaje | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(false)

  useEffect(() => {
    fetchMensaje()
  }, [resolvedParams.id])

  const fetchMensaje = async () => {
    try {
      const res = await fetch(`/api/mensajes/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setMensaje(data.mensaje)
        
        // Mark as read when opened
        if (!data.mensaje.leido) {
          await fetch(`/api/mensajes/${resolvedParams.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leido: true }),
          })
        }
      } else {
        router.push("/admin/mensajes")
      }
    } catch (error) {
      console.error("Error fetching mensaje:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLeido = async () => {
    if (!mensaje) return
    try {
      const res = await fetch(`/api/mensajes/${mensaje.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leido: !mensaje.leido }),
      })
      if (res.ok) {
        const data = await res.json()
        setMensaje(data.mensaje)
      }
    } catch (error) {
      console.error("Error updating mensaje:", error)
    }
  }

  const handleDelete = async () => {
    if (!mensaje) return
    try {
      const res = await fetch(`/api/mensajes/${mensaje.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/admin/mensajes")
      }
    } catch (error) {
      console.error("Error deleting mensaje:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
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

  if (!mensaje) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Mensaje no encontrado</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/mensajes")}
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#3D2314]">Detalle del Mensaje</h1>
            <p className="text-muted-foreground">Enviado el {formatDate(mensaje.creadoEn)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleLeido}
            className="gap-2"
          >
            {mensaje.leido ? (
              <>
                <MailOpen className="w-4 h-4" />
                Marcar como no leido
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Marcar como leido
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Message Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Message */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-[#3D2314] text-xl">
                  {mensaje.asunto}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={mensaje.leido ? "secondary" : "default"}
                    style={!mensaje.leido ? { backgroundColor: "#D4A574", color: "#3D2314" } : {}}
                  >
                    {mensaje.leido ? "Leido" : "No leido"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-[#3D2314] whitespace-pre-wrap">{mensaje.mensaje}</p>
            </div>
          </CardContent>
        </Card>

        {/* Sender Info */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-[#3D2314]">Informacion del Remitente</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium text-[#3D2314]">{mensaje.nombre}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                <MailIcon className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a 
                  href={`mailto:${mensaje.email}`}
                  className="font-medium text-[#D4A574] hover:underline"
                >
                  {mensaje.email}
                </a>
              </div>
            </div>

            {mensaje.telefono && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#3D2314]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefono</p>
                  <a 
                    href={`tel:${mensaje.telefono}`}
                    className="font-medium text-[#D4A574] hover:underline"
                  >
                    {mensaje.telefono}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de envio</p>
                <p className="font-medium text-[#3D2314]">
                  {formatDate(mensaje.creadoEn)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-[#3D2314]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Asunto</p>
                <p className="font-medium text-[#3D2314]">{mensaje.asunto}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Mensaje</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro que desea eliminar este mensaje de &quot;{mensaje.nombre}&quot;?
              Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
