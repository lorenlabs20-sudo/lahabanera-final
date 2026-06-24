"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Trash2, Mail, MailOpen, Circle, Loader2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export default function MensajesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; mensaje: Mensaje | null; isLoading?: boolean }>({
    open: false,
    mensaje: null,
    isLoading: false,
  })

  useEffect(() => {
    fetchMensajes()
  }, [])

  const fetchMensajes = async () => {
    try {
      const res = await fetch("/api/mensajes")
      if (res.ok) {
        const data = await res.json()
        setMensajes(data.mensajes)
      }
    } catch (error) {
      console.error("Error fetching mensajes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLeido = async (mensaje: Mensaje) => {
    const nuevoEstado = !mensaje.leido
    const mensajeNombre = mensaje.nombre

    try {
      const res = await fetch(`/api/mensajes/${mensaje.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leido: nuevoEstado }),
      })

      if (res.ok) {
        await fetchMensajes()

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
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.mensaje) return

    const mensajeNombre = deleteDialog.mensaje.nombre

    setDeleteDialog(prev => ({ ...prev, isLoading: true }))

    try {
      const res = await fetch(`/api/mensajes/${deleteDialog.mensaje.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchMensajes()
        setDeleteDialog({ open: false, mensaje: null, isLoading: false })

        toast({
          title: "Mensaje eliminado",
          description: `El mensaje de ${mensajeNombre} ha sido eliminado correctamente.`,
        })
      } else {
        setDeleteDialog(prev => ({ ...prev, isLoading: false }))
        toast({
          title: "Error",
          description: "No se pudo eliminar el mensaje.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting mensaje:", error)
      setDeleteDialog(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    }
  }

  const filteredMensajes = mensajes.filter((m) => {
    if (estadoFilter === "todos") return true
    if (estadoFilter === "no_leidos") return !m.leido
    if (estadoFilter === "leidos") return m.leido
    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const columns: ColumnDef<Mensaje>[] = [
    {
      id: "leido-indicator",
      accessorKey: "leido",
      header: "",
      cell: ({ row }) => {
        const leido = row.original.leido
        return (
          <div className="flex items-center justify-center">
            {!leido && (
              <Circle className="w-3 h-3 fill-[#D4A574] text-[#D4A574]" />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => {
        const mensaje = row.original
        return (
          <div className="flex items-center gap-2">
            <span className={mensaje.leido ? "" : "font-semibold"}>{mensaje.nombre}</span>
            {!mensaje.leido && (
              <Badge className="bg-[#D4A574] text-[#3D2314] text-xs whitespace-nowrap">Nuevo</Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="max-w-[150px] sm:max-w-none truncate">
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "asunto",
      header: "Asunto",
      cell: ({ row }) => {
        const mensaje = row.original
        return (
          <span className={`${mensaje.leido ? "" : "font-semibold"} truncate block max-w-[150px] sm:max-w-none`}>
            {mensaje.asunto}
          </span>
        )
      },
    },
    {
      accessorKey: "creadoEn",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs sm:text-sm">
          {formatDate(row.original.creadoEn)}
        </span>
      ),
    },
    {
      accessorKey: "leido",
      header: "Estado",
      cell: ({ row }) => {
        const leido = row.original.leido
        return (
          <Badge
            variant={leido ? "secondary" : "default"}
            style={!leido ? { backgroundColor: "#D4A574", color: "#3D2314" } : {}}
            className="whitespace-nowrap"
          >
            {leido ? "Leído" : "No leído"}
          </Badge>
        )
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const mensaje = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/mensajes/${mensaje.id}`)}
              title="Ver mensaje"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleLeido(mensaje)}
              title={mensaje.leido ? "Marcar como no leído" : "Marcar como leído"}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              {mensaje.leido ? (
                <MailOpen className="w-4 h-4" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialog({ open: true, mensaje, isLoading: false })}
              title="Eliminar"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
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

  const unreadCount = mensajes.filter(m => !m.leido).length

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Mensajes</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gestiona los mensajes de contacto
            {unreadCount > 0 && (
              <span className="ml-2 text-[#D4A574] font-medium">
                ({unreadCount} sin leer)
              </span>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-[#3D2314] text-lg sm:text-xl">Bandeja de Entrada</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <DataTable
            columns={columns}
            data={filteredMensajes}
            searchKey="nombre"
            searchPlaceholder="Buscar por nombre..."
            filterComponent={
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="no_leidos">No leídos</SelectItem>
                  <SelectItem value="leidos">Leídos</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open && !deleteDialog.isLoading) {
            setDeleteDialog({ open: false, mensaje: null, isLoading: false })
          }
        }}
      >
        <AlertDialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Eliminar Mensaje</AlertDialogTitle>
            <AlertDialogDescription className="text-sm break-words">
              ¿Está seguro que desea eliminar el mensaje de <span className="font-semibold">"{deleteDialog.mensaje?.nombre}"</span>?
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
              className="w-full sm:w-auto bg-destructive text-white hover:bg-destructive/90"
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