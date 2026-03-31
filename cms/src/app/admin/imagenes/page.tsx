"use client"

import { useEffect, useState } from "react"
import { Image as ImageIcon, Trash2, Plus, Check, X, Loader2, AlertCircle } from "lucide-react"
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

interface Imagen {
  id: string
  url: string
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
  const [submitting, setSubmitting] = useState(false)
  const [urlError, setUrlError] = useState("")
  const [nombreError, setNombreError] = useState("")
  const [imageLoading, setImageLoading] = useState(false)
  const [imageValid, setImageValid] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    url: "",
    nombre: "",
    alt: "",
    tipo: "general",
    enGaleria: false,
  })

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

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError("La URL es requerida")
      return false
    }

    // Validar formato de URL
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i
    if (!urlPattern.test(url)) {
      setUrlError("Ingrese una URL válida (ej: https://ejemplo.com/imagen.jpg)")
      return false
    }

    setUrlError("")
    return true
  }

  const validateNombre = (nombre: string): boolean => {
    if (!nombre.trim()) {
      setNombreError("El nombre es requerido")
      return false
    }
    if (nombre.length < 3) {
      setNombreError("El nombre debe tener al menos 3 caracteres")
      return false
    }
    if (nombre.length > 100) {
      setNombreError("El nombre no puede exceder los 100 caracteres")
      return false
    }
    setNombreError("")
    return true
  }

  const validateImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return false

    setImageLoading(true)
    setImageValid(null)

    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        setImageValid(true)
        setImageLoading(false)
        resolve(true)
      }
      img.onerror = () => {
        setImageValid(false)
        setImageLoading(false)
        resolve(false)
      }
      img.src = url
    })
  }

  const handleUrlChange = async (url: string) => {
    setFormData({ ...formData, url })
    validateUrl(url)
    if (validateUrl(url)) {
      await validateImageUrl(url)
    } else {
      setImageValid(null)
    }
  }

  const handleNombreChange = (nombre: string) => {
    setFormData({ ...formData, nombre })
    validateNombre(nombre)
  }

  const handleToggleGaleria = async (imagen: Imagen) => {
    try {
      const res = await fetch(`/api/imagenes/${imagen.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enGaleria: !imagen.enGaleria }),
      })
      if (res.ok) {
        await fetchImagenes()
        toast({
          title: imagen.enGaleria ? "Imagen quitada de galería" : "Imagen agregada a galería",
          description: `"${imagen.nombre}" ${imagen.enGaleria ? "ya no aparece" : "ahora aparece"} en la galería pública.`,
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de la imagen.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating imagen:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.imagen) return

    setDeleteDialog(prev => ({ ...prev, isLoading: true }))
    const imagenNombre = deleteDialog.imagen.nombre

    try {
      const res = await fetch(`/api/imagenes/${deleteDialog.imagen.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        await fetchImagenes()
        setDeleteDialog({ open: false, imagen: null, isLoading: false })
        toast({
          title: "Imagen eliminada",
          description: `"${imagenNombre}" ha sido eliminada correctamente.`,
        })
      } else {
        setDeleteDialog(prev => ({ ...prev, isLoading: false }))
        toast({
          title: "Error",
          description: "No se pudo eliminar la imagen.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting imagen:", error)
      setDeleteDialog(prev => ({ ...prev, isLoading: false }))
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    }
  }

  const handleAddImagen = async () => {
    // Validaciones
    const isUrlValid = validateUrl(formData.url)
    const isNombreValid = validateNombre(formData.nombre)

    if (!isUrlValid || !isNombreValid) {
      toast({
        title: "Error de validación",
        description: "Por favor corrija los errores en el formulario.",
        variant: "destructive",
      })
      return
    }

    // Validar que la imagen cargue correctamente
    const isValidImage = await validateImageUrl(formData.url)
    if (!isValidImage) {
      toast({
        title: "URL inválida",
        description: "La URL proporcionada no es una imagen válida o no se puede cargar.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/imagenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchImagenes()
        setAddDialog(false)
        setFormData({
          url: "",
          nombre: "",
          alt: "",
          tipo: "general",
          enGaleria: false,
        })
        setUrlError("")
        setNombreError("")
        setImageValid(null)
        toast({
          title: "Imagen agregada",
          description: `"${formData.nombre}" ha sido agregada exitosamente.`,
        })
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo agregar la imagen.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding imagen:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetDialog = () => {
    setAddDialog(false)
    setFormData({
      url: "",
      nombre: "",
      alt: "",
      tipo: "general",
      enGaleria: false,
    })
    setUrlError("")
    setNombreError("")
    setImageValid(null)
  }

  const filteredImagenes = imagenes.filter((img) => {
    if (tipoFilter === "todas") return true
    return img.tipo === tipoFilter
  })

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "producto":
        return "default"
      case "galeria":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTipoBadgeStyle = (tipo: string) => {
    switch (tipo) {
      case "producto":
        return { backgroundColor: "#D4A574", color: "#3D2314" }
      case "galeria":
        return { backgroundColor: "#6B8E5A", color: "white" }
      default:
        return {}
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
          <h1 className="text-2xl font-bold text-[#3D2314]">Imagenes</h1>
          <p className="text-muted-foreground">Gestión de la galería multimedia</p>
        </div>
        <Button
          onClick={() => setAddDialog(true)}
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
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png"
                        e.currentTarget.onerror = null
                      }}
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
                        <Badge variant={getTipoBadgeVariant(imagen.tipo)} style={getTipoBadgeStyle(imagen.tipo)}>
                          {imagen.tipo === "producto" ? "Producto" : imagen.tipo === "galeria" ? "Galería" : "General"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleGaleria(imagen)}
                            title={imagen.enGaleria ? "Quitar de galería" : "Agregar a galería"}
                            className="h-8 w-8"
                          >
                            {imagen.enGaleria ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, imagen, isLoading: false })}
                            title="Eliminar"
                            className="h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

{/* Add Image Dialog */}
<Dialog open={addDialog} onOpenChange={(open) => !open && handleResetDialog()}>
  <DialogContent className="w-[95%] sm:w-full max-w-md mx-auto">
    <DialogHeader>
      <DialogTitle className="text-lg sm:text-xl">Nueva Imagen</DialogTitle>
      <DialogDescription className="text-sm">
        Agrega una nueva imagen proporcionando la URL
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="url" className="text-[#3D2314]">
          URL de la imagen{' '}
          <span className={`${(!formData.url || urlError) ? 'text-red-500' : 'text-[#3D2314]'} transition-colors`}>
            *
          </span>
        </Label>
        <div className="relative">
          <Input
            id="url"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={formData.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={`w-full ${urlError ? "border-red-500" : ""} ${
              imageValid === true && !urlError && formData.url ? "border-green-500" : ""
            } pr-10`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {imageLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            {imageValid === true && !imageLoading && formData.url && (
              <Check className="w-4 h-4 text-green-500" />
            )}
            {imageValid === false && !imageLoading && formData.url && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        {urlError && <p className="text-xs text-red-500">{urlError}</p>}
        {imageValid === true && !urlError && formData.url && (
          <p className="text-xs text-green-500">✓ Imagen válida</p>
        )}
        {imageValid === false && !urlError && formData.url && (
          <p className="text-xs text-red-500">✗ La imagen no se pudo cargar</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombre" className="text-[#3D2314]">
          Nombre{' '}
          <span className={`${(!formData.nombre || nombreError) ? 'text-red-500' : 'text-[#3D2314]'} transition-colors`}>
            *
          </span>
        </Label>
        <Input
          id="nombre"
          placeholder="Nombre descriptivo"
          value={formData.nombre}
          onChange={(e) => handleNombreChange(e.target.value)}
          className={`w-full ${nombreError ? "border-red-500" : ""} ${
            !nombreError && formData.nombre ? "border-green-500" : ""
          }`}
        />
        {nombreError && <p className="text-xs text-red-500">{nombreError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="alt" className="text-[#3D2314]">Texto alternativo</Label>
        <Input
          id="alt"
          placeholder="Descripción de la imagen (accesibilidad)"
          value={formData.alt}
          onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Importante para accesibilidad y SEO
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo" className="text-[#3D2314]">Tipo</Label>
        <Select
          value={formData.tipo}
          onValueChange={(value) => setFormData({ ...formData, tipo: value })}
        >
          <SelectTrigger className="w-full">
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
    </div>
    <DialogFooter className="flex-col sm:flex-row gap-2">
      <Button variant="outline" onClick={handleResetDialog} className="w-full sm:w-auto">
        Cancelar
      </Button>
      <Button
        onClick={handleAddImagen}
        disabled={!formData.url || !formData.nombre || submitting || imageValid === false}
        style={{ backgroundColor: "#3D2314" }}
        className="w-full sm:w-auto text-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogTitle className="text-lg sm:text-xl">Eliminar Imagen</AlertDialogTitle>
            <AlertDialogDescription className="text-sm break-words">
              ¿Está seguro que desea eliminar la imagen <span className="font-semibold">"{deleteDialog.imagen?.nombre}"</span>?
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