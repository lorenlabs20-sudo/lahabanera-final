// admin/productos/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Plus, Power, PowerOff, Package } from "lucide-react"
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


interface Categoria {
  id: string
  nombre: string
  _count?: {
    productos: number
  }
}

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  imagen: string | null
  activo: boolean
  categoriaId: string
  categoria: Categoria
}

export default function ProductosPage() {
  const router = useRouter()
  const { toast } = useToast();
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todas")
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; producto: Producto | null }>({
    open: false,
    producto: null,
  })

  useEffect(() => {
    fetchProductos()
    fetchCategorias()
  }, [])

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/productos?includeCategoria=true")
      if (res.ok) {
        const data = await res.json()
        setProductos(data.productos)
      } else {
        throw new Error("Error al cargar productos")
      }
    } catch (error) {
      console.error("Error fetching productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias?includeCount=true")
      if (res.ok) {
        const data = await res.json()
        setCategorias(data.categorias)
      }
    } catch (error) {
      console.error("Error fetching categorias:", error)
    }
  }

  const handleToggleActivo = async (producto: Producto) => {
    try {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !producto.activo }),
      })
      if (res.ok) {
        await fetchProductos() // Recargar productos
        toast({
          title: "Estado actualizado",
          description: `Producto ${!producto.activo ? "activado" : "desactivado"} correctamente`,
        })
      } else {
        throw new Error("Error al actualizar estado")
      }
    } catch (error) {
      console.error("Error updating producto:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del producto",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.producto) return
    
    try {
      const res = await fetch(`/api/productos/${deleteDialog.producto.id}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        await Promise.all([
          fetchProductos(), // Recargar productos
          fetchCategorias() // Recargar categorías para actualizar contadores
        ])
        setDeleteDialog({ open: false, producto: null })
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado correctamente",
        })
      } else {
        const error = await res.json()
        throw new Error(error.error || "Error al eliminar producto")
      }
    } catch (error) {
      console.error("Error deleting producto:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const filteredProductos = productos.filter((p) => {
    if (categoriaFilter === "todas") return true
    return p.categoriaId === categoriaFilter
  })

  const columns: ColumnDef<Producto>[] = [
    {
      accessorKey: "imagen",
      header: "Imagen",
      cell: ({ row }) => {
        const imagen = row.original.imagen
        return (
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {imagen ? (
              <img
                src={imagen}
                alt={row.original.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => row.original.categoria?.nombre || "-",
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => {
        const activo = row.original.activo
        return (
          <Badge variant={activo ? "default" : "secondary"}>
            {activo ? "Activo" : "Inactivo"}
          </Badge>
        )
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const producto = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/productos/${producto.id}/editar`)}
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleActivo(producto)}
              title={producto.activo ? "Desactivar" : "Activar"}
            >
              {producto.activo ? (
                <PowerOff className="w-4 h-4" />
              ) : (
                <Power className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialog({ open: true, producto })}
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Productos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestión del catálogo de productos</p>
        </div>
        <Button
          onClick={() => router.push("/admin/productos/nuevo")}
          style={{ backgroundColor: "#3D2314" }}
          className="text-white hover:opacity-90 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#3D2314]">Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredProductos}
            searchKey="nombre"
            searchPlaceholder="Buscar por nombre..."
            filterComponent={
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nombre} ({cat._count?.productos || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, producto: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar el producto &quot;{deleteDialog.producto?.nombre}&quot;? 
              Esta acción no se puede deshacer.
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