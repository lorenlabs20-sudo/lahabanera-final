"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, FolderOpen } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
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

interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  _count?: {
    productos: number
  }
}

export default function CategoriasPage() {
  const router = useRouter()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ 
    open: boolean
    categoria: Categoria | null 
    error: string | null 
  }>({
    open: false,
    categoria: null,
    error: null,
  })

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias")
      if (res.ok) {
        const data = await res.json()
        setCategorias(data.categorias)
      }
    } catch (error) {
      console.error("Error fetching categorias:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.categoria) return
    try {
      const res = await fetch(`/api/categorias/${deleteDialog.categoria.id}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        fetchCategorias()
        setDeleteDialog({ open: false, categoria: null, error: null })
      } else {
        const error = await res.json()
        setDeleteDialog({ 
          ...deleteDialog, 
          error: error.error || "No se puede eliminar la categoria" 
        })
      }
    } catch (error) {
      console.error("Error deleting categoria:", error)
      setDeleteDialog({ 
        ...deleteDialog, 
        error: "Error al eliminar la categoria" 
      })
    }
  }

  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-[#D4A574]" />
          <span className="font-medium">{row.original.nombre}</span>
        </div>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripcion",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.descripcion || "-"}
        </span>
      ),
    },
    {
      id: "productos",
      header: "Cantidad de Productos",
      cell: ({ row }) => {
        const count = row.original._count?.productos || 0
        return (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#D4A574]/20 text-[#3D2314] text-sm font-medium">
            {count}
          </span>
        )
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const categoria = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/categorias/${categoria.id}/editar`)}
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialog({ open: true, categoria, error: null })}
              title="Eliminar"
              disabled={categoria._count?.productos ? categoria._count.productos > 0 : false}
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

    return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Categorias</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestion de categorias de productos</p>
        </div>
        <Button
          onClick={() => router.push("/admin/categorias/nuevo")}
          style={{ backgroundColor: "#3D2314" }}
          className="text-white hover:opacity-90 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoria
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-[#3D2314]">Lista de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={categorias}
            searchKey="nombre"
            searchPlaceholder="Buscar por nombre..."
          />
        </CardContent>
      </Card>

      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ open, categoria: null, error: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.error ? (
                <span className="text-destructive">{deleteDialog.error}</span>
              ) : (
                <>
                  Esta seguro que desea eliminar la categoria &quot;{deleteDialog.categoria?.nombre}&quot;?
                  Esta accion no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {deleteDialog.error ? "Cerrar" : "Cancelar"}
            </AlertDialogCancel>
            {!deleteDialog.error && (
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
