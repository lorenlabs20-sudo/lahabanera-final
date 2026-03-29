"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Trash2, Mail, MailOpen, Circle } from "lucide-react"
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
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; mensaje: Mensaje | null }>({
    open: false,
    mensaje: null,
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
    try {
      const res = await fetch(`/api/mensajes/${mensaje.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leido: !mensaje.leido }),
      })
      if (res.ok) {
        fetchMensajes()
      }
    } catch (error) {
      console.error("Error updating mensaje:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.mensaje) return
    try {
      const res = await fetch(`/api/mensajes/${deleteDialog.mensaje.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchMensajes()
        setDeleteDialog({ open: false, mensaje: null })
      }
    } catch (error) {
      console.error("Error deleting mensaje:", error)
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
              <Badge className="bg-[#D4A574] text-[#3D2314] text-xs">Nuevo</Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "asunto",
      header: "Asunto",
      cell: ({ row }) => {
        const mensaje = row.original
        return (
          <span className={mensaje.leido ? "" : "font-semibold"}>
            {mensaje.asunto}
          </span>
        )
      },
    },
    {
      accessorKey: "creadoEn",
      header: "Fecha",
      cell: ({ row }) => formatDate(row.original.creadoEn),
    },
    {
      accessorKey: "leido",
      header: "Estado",
      cell: ({ row }) => {
        const leido = row.original.leido
        return (
          <Badge variant={leido ? "secondary" : "default"} 
            style={!leido ? { backgroundColor: "#D4A574", color: "#3D2314" } : {}}
          >
            {leido ? "Leido" : "No leido"}
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/mensajes/${mensaje.id}`)}
              title="Ver mensaje"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleLeido(mensaje)}
              title={mensaje.leido ? "Marcar como no leido" : "Marcar como leido"}
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
              onClick={() => setDeleteDialog({ open: true, mensaje })}
              title="Eliminar"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2314]">Mensajes</h1>
          <p className="text-muted-foreground">
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
        <CardHeader>
          <CardTitle className="text-[#3D2314]">Bandeja de Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredMensajes}
            searchKey="nombre"
            searchPlaceholder="Buscar por nombre..."
            filterComponent={
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="no_leidos">No leidos</SelectItem>
                  <SelectItem value="leidos">Leidos</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, mensaje: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Mensaje</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro que desea eliminar el mensaje de &quot;{deleteDialog.mensaje?.nombre}&quot;?
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
