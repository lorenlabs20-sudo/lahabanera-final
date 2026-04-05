"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ImageUploader } from "@/components/ui/ImageUploader"

interface Categoria {
  id: string
  nombre: string
  productoCount?: number
}

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  imagen: string | null
  publicId: string | null
  activo: boolean
  categoriaId: string
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const productoId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [errors, setErrors] = useState<{
    nombre?: string
    categoriaId?: string
    imagen?: string
  }>({})
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    imagen: "",
    publicId: "",
    categoriaId: "",
    activo: true,
  })
  const [originalData, setOriginalData] = useState({
    nombre: "",
    categoriaId: "",
    imagen: "",
    publicId: "",
    descripcion: "",
    activo: true,
  })

  useEffect(() => {
    fetchCategorias()
    fetchProducto()
  }, [productoId])

  const fetchCategorias = async () => {
    try {
      const res = await fetch("/api/categorias")
      if (res.ok) {
        const data = await res.json()
        setCategorias(data.categorias)
      }
    } catch (error) {
      console.error("Error fetching categorias:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    }
  }

  const fetchProducto = async () => {
    try {
      const res = await fetch(`/api/productos/${productoId}`)
      if (res.ok) {
        const data = await res.json()
        const producto: Producto = data.producto
        setFormData({
          nombre: producto.nombre,
          descripcion: producto.descripcion || "",
          imagen: producto.imagen || "",
          publicId: producto.publicId || "",
          categoriaId: producto.categoriaId,
          activo: producto.activo,
        })
        setOriginalData({
          nombre: producto.nombre,
          categoriaId: producto.categoriaId,
          imagen: producto.imagen || "",
          publicId: producto.publicId || "",
          descripcion: producto.descripcion || "",
          activo: producto.activo,
        })
      } else {
        toast({
          title: "Error",
          description: "Producto no encontrado",
          variant: "destructive",
        })
        router.push("/admin/productos")
      }
    } catch (error) {
      console.error("Error fetching producto:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (url: string, publicId: string) => {
    setFormData(prev => ({
      ...prev,
      imagen: url,
      publicId: publicId,
    }))

    if (errors.imagen) {
      setErrors({ ...errors, imagen: undefined })
    }

    toast({
      title: "✓ Imagen subida",
      description: "La imagen se ha actualizado correctamente",
      duration: 3000,
    })
  }

  const handleUploadError = (error: string) => {
    toast({
      title: "Error al subir",
      description: error,
      variant: "destructive",
    })
    setErrors({ ...errors, imagen: error })
  }

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      imagen: "",
      publicId: "",
    }))

    toast({
      title: "Imagen removida",
      description: "La imagen ha sido removida. Puedes subir una nueva.",
      duration: 3000,
    })
  }

  const validateForm = () => {
    const newErrors: { nombre?: string; categoriaId?: string; imagen?: string } = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del producto es requerido"
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres"
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = "El nombre no puede exceder los 100 caracteres"
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = "Debe seleccionar una categoría"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = validateForm()
    if (!isValid) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/productos/${productoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
          imagen: formData.imagen.trim() || null,
          publicId: formData.publicId || null,
          categoriaId: formData.categoriaId,
          activo: formData.activo,
        }),
      })

      if (res.ok) {
        toast({
          title: "Producto actualizado",
          description: `El producto "${formData.nombre}" ha sido actualizado exitosamente`,
          variant: "default",
        })
        router.push("/admin/productos")
      } else {
        const error = await res.json()
        toast({
          title: "Error al actualizar",
          description: error.error || "No se pudo actualizar el producto",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating producto:", error)
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
      const res = await fetch(`/api/productos/${productoId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Producto eliminado",
          description: `El producto "${formData.nombre}" ha sido eliminado`,
          variant: "default",
        })
        router.push("/admin/productos")
      } else {
        const error = await res.json()
        toast({
          title: "Error al eliminar",
          description: error.error || "No se pudo eliminar el producto",
          variant: "destructive",
        })
        setShowDeleteDialog(false)
      }
    } catch (error) {
      console.error("Error deleting producto:", error)
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
    if (errors.nombre && value.trim()) {
      setErrors({ ...errors, nombre: undefined })
    }
  }

  const handleCategoriaChange = (value: string) => {
    setFormData({ ...formData, categoriaId: value })
    if (errors.categoriaId) {
      setErrors({ ...errors, categoriaId: undefined })
    }
  }

  const hasChanges = () => {
    return (
      formData.nombre.trim() !== originalData.nombre ||
      formData.categoriaId !== originalData.categoriaId ||
      formData.descripcion.trim() !== originalData.descripcion ||
      formData.imagen.trim() !== originalData.imagen ||
      formData.activo !== originalData.activo
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
            onClick={() => router.push("/admin/productos")}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Editar Producto</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Modificar la información del producto
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
          Eliminar Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#3D2314] text-lg sm:text-xl">
            Información del Producto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleNombreChange}
                  placeholder="Nombre del producto"
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
                  Nombre descriptivo del producto (3-100 caracteres)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm font-medium">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.categoriaId}
                  onValueChange={handleCategoriaChange}
                  disabled={saving}
                >
                  <SelectTrigger className={cn(
                    "w-full",
                    errors.categoriaId && "border-destructive focus-visible:ring-destructive"
                  )}>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                        No hay categorías disponibles
                      </div>
                    ) : (
                      categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.categoriaId && (
                  <p id="categoria-error" className="text-sm text-destructive">
                    {errors.categoriaId}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el producto, sus características, especificaciones..."
                rows={4}
                className="resize-none"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Descripción detallada del producto (opcional, máximo 500 caracteres)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Imagen del Producto
              </Label>
              <ImageUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onImageRemove={handleImageRemove}
                tipo="producto"
                initialImage={formData.imagen ? { url: formData.imagen, publicId: formData.publicId } : undefined}
                isEditing={true}
              />
              <p className="text-xs text-muted-foreground">
                Sube una imagen para el producto (opcional). Haz clic en ✕ para cambiar la imagen.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                disabled={saving}
              />
              <Label htmlFor="activo" className="text-sm font-medium">
                Producto activo
              </Label>
              <span className="text-xs text-muted-foreground ml-2">
                (Los productos inactivos no se muestran en la tienda)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/productos")}
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
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el producto &quot;{formData.nombre}&quot;?
              <br />
              <br />
              Esta acción no se puede deshacer. El producto será eliminado permanentemente
              del catálogo y <strong className="text-destructive">no podrá ser recuperado</strong>.
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