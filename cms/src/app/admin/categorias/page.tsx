// admin/categorias/page.tsx
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
import { useToast } from "@/hooks/use-toast"

interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  productoCount?: number  // 👈 Campo simplificado para el contador
  _count?: {
    productos: number
  }
}

export default function CategoriasPage() {
  const router = useRouter()
  const { toast } = useToast();
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
        // Asegurar que todas las categorías tengan un contador
        const categoriasConContador = data.categorias.map((cat: any) => ({
          ...cat,
          productoCount: cat.productoCount || cat._count?.productos || 0
        }))
        setCategorias(categoriasConContador)
      } else {
        throw new Error("Error al cargar categorías")
      }
    } catch (error) {
      console.error("Error fetching categorias:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.categoria) return

    // Obtener el contador actualizado
    const productCount = deleteDialog.categoria.productoCount || deleteDialog.categoria._count?.productos || 0

    // Verificar si tiene productos antes de intentar eliminar
    if (productCount > 0) {
      setDeleteDialog({
        ...deleteDialog,
        error: `No se puede eliminar la categoría "${deleteDialog.categoria.nombre}" porque tiene ${productCount} producto(s) asociado(s).`
      })
      return
    }

    try {
      const res = await fetch(`/api/categorias/${deleteDialog.categoria.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchCategorias() // Recargar categorías para actualizar contadores
        setDeleteDialog({ open: false, categoria: null, error: null })
        toast({
          title: "Categoría eliminada",
          description: "La categoría ha sido eliminada correctamente",
        })
      } else {
        const error = await res.json()
        setDeleteDialog({
          ...deleteDialog,
          error: error.error || "No se puede eliminar la categoría"
        })
      }
    } catch (error) {
      console.error("Error deleting categoria:", error)
      setDeleteDialog({
        ...deleteDialog,
        error: "Error al eliminar la categoría"
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
      header: "Descripción",
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
        // Usar productoCount si está disponible, sino usar _count
        const count = row.original.productoCount || row.original._count?.productos || 0
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#D4A574]/20 text-[#3D2314] text-sm font-medium">
              {count}
            </span>
            {count > 0 && (
              <span className="text-xs text-muted-foreground">
                {count === 1 ? "producto" : "productos"}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const categoria = row.original
        const hasProducts = (categoria.productoCount || categoria._count?.productos || 0) > 0

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
              title={hasProducts ? `No se puede eliminar: tiene ${categoria.productoCount || categoria._count?.productos || 0} producto(s) asociado(s)` : "Eliminar"}
              disabled={hasProducts}
              className={hasProducts ? "opacity-50 cursor-not-allowed" : ""}
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

  // Calcular total de productos usando productoCount
  const totalProductos = categorias.reduce((sum, cat) => sum + (cat.productoCount || cat._count?.productos || 0), 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Categorías</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestión de categorías de productos | Total de productos: {totalProductos}
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/categorias/nuevo")}
          style={{ backgroundColor: "#3D2314" }}
          className="text-white hover:opacity-90 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#3D2314]">Lista de Categorías</CardTitle>
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
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({ open: false, categoria: null, error: null })
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.error ? "No se puede eliminar" : "Eliminar Categoría"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.error ? (
                <div className="space-y-2">
                  <p className="text-destructive font-medium">{deleteDialog.error}</p>
                  <p className="text-sm text-muted-foreground">
                    Para eliminar esta categoría, primero debe:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Mover o eliminar los productos asociados</li>
                      <li>O reasignar los productos a otra categoría</li>
                    </ul>
                  </p>
                </div>
              ) : (
                <>
                  ¿Está seguro que desea eliminar la categoría &quot;{deleteDialog.categoria?.nombre}&quot;?
                  Esta acción no se puede deshacer.
                  {(deleteDialog.categoria?.productoCount || deleteDialog.categoria?._count?.productos || 0) > 0 && (
                    <p className="text-destructive mt-2">
                      ⚠️ Esta categoría tiene {deleteDialog.categoria?.productoCount || deleteDialog.categoria?._count?.productos || 0} producto(s) asociado(s).
                    </p>
                  )}
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
                disabled={(deleteDialog.categoria?.productoCount || deleteDialog.categoria?._count?.productos || 0) > 0}
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