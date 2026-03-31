"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
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
  productoCount?: number
}

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const categoriaId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [errors, setErrors] = useState<{ nombre?: string }>({})
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })
  const [originalNombre, setOriginalNombre] = useState("")

  useEffect(() => {
    fetchCategoria()
  }, [categoriaId])

  const fetchCategoria = async () => {
    try {
      const res = await fetch(`/api/categorias/${categoriaId}`)
      if (res.ok) {
        const data = await res.json()
        const categoria: Categoria = data.categoria || data
        setFormData({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion || "",
        })
        setOriginalNombre(categoria.nombre)
      } else {
        toast({
          title: "Error",
          description: "Categoría no encontrada",
          variant: "destructive",
        })
        router.push("/admin/categorias")
      }
    } catch (error) {
      console.error("Error fetching categoria:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo cargar la categoría",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: { nombre?: string } = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre de la categoría es requerido"
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = "El nombre no puede exceder los 50 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/categorias/${categoriaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
        }),
      })

      if (res.ok) {
        toast({
          title: "Categoría actualizada",
          description: `La categoría "${formData.nombre}" ha sido actualizada exitosamente`,
          variant: "default",
        })
        router.push("/admin/categorias")
      } else {
        const error = await res.json()
        toast({
          title: "Error al actualizar",
          description: error.error || "No se pudo actualizar la categoría",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating categoria:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/categorias/${categoriaId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Categoría eliminada",
          description: `La categoría "${formData.nombre}" ha sido eliminada`,
          variant: "default",
        })
        router.push("/admin/categorias")
      } else {
        const error = await res.json()
        toast({
          title: "Error al eliminar",
          description: error.error || "No se pudo eliminar la categoría",
          variant: "destructive",
        })
        setShowDeleteDialog(false)
      }
    } catch (error) {
      console.error("Error deleting categoria:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, nombre: value })
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors.nombre && value.trim()) {
      setErrors({})
    }
  }

  const hasChanges = () => {
    return (
      formData.nombre.trim() !== originalNombre ||
      formData.descripcion.trim() !== (formData.descripcion)
    )
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/categorias")}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Editar Categoría</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Modificar la información de la categoría
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="w-full sm:w-auto"
          disabled={saving}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar Categoría
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#3D2314] text-lg sm:text-xl">
            Información de la Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={handleNombreChange}
                placeholder="Ej: Electrónicos, Ropa, Hogar..."
                className={cn(
                  "w-full",
                  errors.nombre && "border-destructive focus-visible:ring-destructive"
                )}
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? "nombre-error" : undefined}
                disabled={saving}
              />
              {errors.nombre && (
                <p id="nombre-error" className="text-sm text-destructive">
                  {errors.nombre}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                El nombre debe ser único y tener entre 2 y 50 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe brevemente la categoría (opcional)"
                rows={4}
                className="resize-none"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Máximo 200 caracteres
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/categorias")}
                className="w-full sm:w-auto order-2 sm:order-1"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !hasChanges()}
                style={{ backgroundColor: "#3D2314" }}
                className={cn(
                  "w-full sm:w-auto text-white hover:opacity-90 order-1 sm:order-2",
                  (!hasChanges() || saving) && "opacity-50 cursor-not-allowed"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría &quot;{formData.nombre}&quot;?
              <br />
              <br />
              Esta acción no se puede deshacer. Los productos asociados a esta categoría
              <strong className="text-destructive"> no se eliminarán</strong>, pero quedarán
              sin categoría asignada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}