"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, MailOpen, Trash2, Phone, Mail as MailIcon, Calendar, User, MessageSquare, Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [mensaje, setMensaje] = useState<Mensaje | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    fetchMensaje()
  }, [resolvedParams.id])

  const fetchMensaje = async () => {
    try {
      const res = await fetch(`/api/mensajes/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        let mensajeData = data.mensaje

        // Mark as read when opened
        if (!mensajeData.leido) {
          const updateRes = await fetch(`/api/mensajes/${resolvedParams.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leido: true }),
          })
          if (updateRes.ok) {
            const updateData = await updateRes.json()
            mensajeData = updateData.mensaje
          }
        }

        setMensaje(mensajeData)
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
    if (!mensaje || isToggling) return

    setIsToggling(true)
    const nuevoEstado = !mensaje.leido
    const mensajeNombre = mensaje.nombre

    try {
      const res = await fetch(`/api/mensajes/${mensaje.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leido: nuevoEstado }),
      })

      if (res.ok) {
        const data = await res.json()
        setMensaje(data.mensaje)

        if (nuevoEstado) {
          toast({
            title: "Mensaje marcado como leído",
            description: `El mensaje de ${mensajeNombre} ha sido marcado como leído.`,
          })
        } else {
          toast({
            title: "Mensaje marcado como no leído",
            description: `El mensaje de ${mensajeNombre} ha sido marcado como no leído.`,
          })
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del mensaje.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating mensaje:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!mensaje || isDeleting) return

    setIsDeleting(true)
    const mensajeNombre = mensaje.nombre

    try {
      const res = await fetch(`/api/mensajes/${mensaje.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Mensaje eliminado",
          description: `El mensaje de ${mensajeNombre} ha sido eliminado correctamente.`,
        })
        router.push("/admin/mensajes")
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el mensaje.",
          variant: "destructive",
        })
        setDeleteDialog(false)
      }
    } catch (error) {
      console.error("Error deleting mensaje:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/mensajes")}
            title="Volver"
            className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#3D2314] truncate">
              Detalle del Mensaje
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Enviado el {formatDate(mensaje.creadoEn)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
          <Button
            variant="outline"
            onClick={handleToggleLeido}
            disabled={isToggling}
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
          >
            {isToggling ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : mensaje.leido ? (
              <MailOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="hidden xs:inline">
              {mensaje.leido ? "Marcar no leído" : "Marcar leído"}
            </span>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialog(true)}
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Eliminar</span>
          </Button>
        </div>
      </div>

      {/* Message Content - Responsive Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Message */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-2">
              <CardTitle className="text-[#3D2314] text-lg sm:text-xl break-words">
                {mensaje.asunto}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant={mensaje.leido ? "secondary" : "default"}
                  style={!mensaje.leido ? { backgroundColor: "#D4A574", color: "#3D2314" } : {}}
                  className="whitespace-nowrap"
                >
                  {mensaje.leido ? "Leído" : "No leído"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pt-6 pb-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-[#3D2314] whitespace-pre-wrap text-sm sm:text-base break-words">
                {mensaje.mensaje}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sender Info */}
        <Card>
          <CardHeader className="border-b px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-[#3D2314] text-lg sm:text-xl">Información del Remitente</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pt-6 pb-6 space-y-4 sm:space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium text-[#3D2314] text-sm sm:text-base break-words">{mensaje.nombre}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                <MailIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${mensaje.email}`}
                  className="font-medium text-[#D4A574] hover:underline text-sm sm:text-base break-all"
                >
                  {mensaje.email}
                </a>
              </div>
            </div>

            {mensaje.telefono && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Teléfono</p>
                  <a
                    href={`tel:${mensaje.telefono}`}
                    className="font-medium text-[#D4A574] hover:underline text-sm sm:text-base break-words"
                  >
                    {mensaje.telefono}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Fecha de envío</p>
                <p className="font-medium text-[#3D2314] text-sm sm:text-base break-words">
                  {formatDate(mensaje.creadoEn)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Asunto</p>
                <p className="font-medium text-[#3D2314] text-sm sm:text-base break-words">{mensaje.asunto}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Eliminar Mensaje</AlertDialogTitle>
            <AlertDialogDescription className="text-sm break-words">
              ¿Está seguro que desea eliminar este mensaje de <span className="font-semibold">"{mensaje.nombre}"</span>?
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? (
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