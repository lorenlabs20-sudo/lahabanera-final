"use client"

import { useEffect, useState } from "react"
import { Image as ImageIcon, Trash2, Plus, Check, X, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ImageUploader } from "@/components/ui/ImageUploader"

interface Imagen {
  id: string
  url: string
  publicId?: string
  nombre: string
  alt: string | null
  tipo: string
  enGaleria: boolean
  creadoEn: string
}

export default function ImagenesPage() {
  const { toast } = useToast()
  const [imagenes, setImagenes] = useState<Imagen[]>([])
  const [tipoFilter, setTipoFilter] = useState<string>("todas")
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; imagen: Imagen | null; isLoading?: boolean }>({
    open: false,
    imagen: null,
    isLoading: false,
  })
  const [addDialog, setAddDialog] = useState(false)

  const [formData, setFormData] = useState({
    url: "",
    publicId: "",
    nombre: "",
    alt: "",
    tipo: "general",
    enGaleria: false,
  })

  // Estado para saber si estamos editando o creando nueva
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchImagenes()
  }, [])

  const fetchImagenes = async () => {
    try {
      const res = await fetch("/api/imagenes")
      if (res.ok) {
        const data = await res.json()
        setImagenes(data.imagenes)
      }
    } catch (error) {
      console.error("Error fetching imagenes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (url: string, publicId: string) => {
    setFormData(prev => ({
      ...prev,
      url: url,
      publicId: publicId,
    }))

    toast({
      title: "✓ Imagen subida",
      description: "La imagen se ha subido correctamente. Ahora completa sus datos.",
      duration: 3000,
    })
  }

  const handleUploadError = (error: string) => {
    toast({
      title: "Error al subir",
      description: error,
      variant: "destructive",
    })
  }

  const handleAddImagen = async () => {
    if (!formData.url || !formData.nombre) {
      toast({
        title: "Error",
        description: "Debe subir una imagen y completar el nombre",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/imagenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formData.url,
          publicId: formData.publicId,
          nombre: formData.nombre,
          alt: formData.alt,
          tipo: formData.tipo,
          enGaleria: formData.enGaleria,
        }),
      })

      if (res.ok) {
        await fetchImagenes()
        setAddDialog(false)
        resetForm()

        toast({
          title: "Imagen agregada",
          description: `"${formData.nombre}" ha sido agregada exitosamente`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar la imagen",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding imagen:", error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    }
  }

  const handleEditImagen = async () => {
    if (!formData.url || !formData.nombre) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch(`/api/imagenes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          alt: formData.alt,
          tipo: formData.tipo,
          enGaleria: formData.enGaleria,
        }),
      })

      if (res.ok) {
        await fetchImagenes()
        setAddDialog(false)
        resetForm()

        toast({
          title: "Imagen actualizada",
          description: `"${formData.nombre}" ha sido actualizada exitosamente`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar la imagen",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error editing imagen:", error)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.imagen) return

    setDeleteDialog(prev => ({ ...prev, isLoading: true }))

    try {
      const res = await fetch(`/api/imagenes/${deleteDialog.imagen.id}`, {
        method: "DELETE",
        body: JSON.stringify({ publicId: deleteDialog.imagen.publicId }),
      })

      if (res.ok) {
        await fetchImagenes()
        setDeleteDialog({ open: false, imagen: null, isLoading: false })
        toast({
          title: "Imagen eliminada",
          description: "La imagen ha sido eliminada correctamente",
        })
      } else {
        setDeleteDialog(prev => ({ ...prev, isLoading: false }))
        toast({
          title: "Error",
          description: "No se pudo eliminar la imagen",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting imagen:", error)
      setDeleteDialog(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      url: "",
      publicId: "",
      nombre: "",
      alt: "",
      tipo: "general",
      enGaleria: false,
    })
    setIsEditing(false)
    setEditingId(null)
  }

  const handleResetDialog = () => {
    setAddDialog(false)
    resetForm()
  }
  const handleImageRemove = () => {
    // Limpiar los datos de la imagen en el formulario
    setFormData(prev => ({
      ...prev,
      url: "",
      publicId: "",
    }))

    // Mostrar toast indicando que se quitó la imagen
    toast({
      title: "Imagen removida",
      description: "La imagen ha sido removida. Puedes subir una nueva.",
      duration: 3000,
    })
  }

  const openEditDialog = (imagen: Imagen) => {
    setFormData({
      url: imagen.url,
      publicId: imagen.publicId || "",
      nombre: imagen.nombre,
      alt: imagen.alt || "",
      tipo: imagen.tipo,
      enGaleria: imagen.enGaleria,
    })
    setIsEditing(true)
    setEditingId(imagen.id)
    setAddDialog(true)
  }

  const filteredImagenes = imagenes.filter((img) => {
    if (tipoFilter === "todas") return true
    return img.tipo === tipoFilter
  })

  const getTipoBadgeStyle = (tipo: string) => {
    switch (tipo) {
      case "producto":
        return { backgroundColor: "#D4A574", color: "#3D2314" }
      case "galeria":
        return { backgroundColor: "#6B8E5A", color: "white" }
      default:
        return { backgroundColor: "#E8E4D9", color: "#3D2314" }
    }
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
        <div>
          <h1 className="text-2xl font-bold text-[#3D2314]">Imágenes</h1>
          <p className="text-muted-foreground">Gestión de la galería multimedia</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setAddDialog(true)
          }}
          style={{ backgroundColor: "#3D2314" }}
          className="text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Imagen
        </Button>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-[#3D2314] text-lg sm:text-xl">Galería de Imágenes</CardTitle>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los tipos</SelectItem>
                <SelectItem value="producto">Producto</SelectItem>
                <SelectItem value="galeria">Galería</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {filteredImagenes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay imágenes registradas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImagenes.map((imagen) => (
                <Card key={imagen.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    <img
                      src={imagen.url}
                      alt={imagen.alt || imagen.nombre}
                      className="w-full h-full object-cover"
                    />
                    {imagen.enGaleria && (
                      <div className="absolute top-2 right-2">
                        <Badge style={{ backgroundColor: "#6B8E5A", color: "white" }}>
                          En Galería
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-[#3D2314] truncate">{imagen.nombre}</h3>
                      <div className="flex items-center justify-between">
                        <Badge style={getTipoBadgeStyle(imagen.tipo)}>
                          {imagen.tipo === "producto" ? "Producto" : imagen.tipo === "galeria" ? "Galería" : "General"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(imagen)}
                            title="Editar"
                            className="h-8 w-8 text-blue-500 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, imagen, isLoading: false })}
                            title="Eliminar"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Image Dialog - MODIFICADO PARA MANTENER LA IMAGEN */}
      <Dialog open={addDialog} onOpenChange={(open) => !open && handleResetDialog()}>
        <DialogContent className="w-[95%] sm:w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {isEditing ? "Editar Imagen" : "Nueva Imagen"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isEditing
                ? "Edita los datos de la imagen seleccionada"
                : "Sube una imagen desde tu computadora y completa sus datos"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <ImageUploader
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              onImageRemove={handleImageRemove}
              tipo={formData.tipo}
              initialImage={formData.url ? { url: formData.url, publicId: formData.publicId } : undefined}
              isEditing={isEditing}
            />

            {/* Siempre mostrar los campos de datos */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-[#3D2314]">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                placeholder="Nombre descriptivo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt" className="text-[#3D2314]">Texto alternativo</Label>
              <Input
                id="alt"
                placeholder="Descripción de la imagen (accesibilidad)"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-[#3D2314]">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="producto">Producto</SelectItem>
                  <SelectItem value="galeria">Galería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enGaleria"
                checked={formData.enGaleria}
                onCheckedChange={(checked) => setFormData({ ...formData, enGaleria: checked as boolean })}
              />
              <Label htmlFor="enGaleria" className="cursor-pointer text-sm">
                Mostrar en galería pública
              </Label>
            </div>

            {/* Mensaje de ayuda para edición */}
            {isEditing && (
              <p className="text-xs text-muted-foreground text-center">
                Nota: Para cambiar la imagen, haz clic en ✕ y sube una nueva
              </p>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleResetDialog} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              onClick={isEditing ? handleEditImagen : handleAddImagen}
              disabled={!formData.url || !formData.nombre}
              style={{ backgroundColor: "#3D2314" }}
              className="w-full sm:w-auto text-white hover:opacity-90 disabled:opacity-50"
            >
              {isEditing ? "Actualizar Imagen" : "Guardar Imagen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open && !deleteDialog.isLoading) {
            setDeleteDialog({ open: false, imagen: null, isLoading: false })
          }
        }}
      >
        <AlertDialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Imagen</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar la imagen "{deleteDialog.imagen?.nombre}"?
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
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