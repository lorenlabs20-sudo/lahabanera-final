"use client"

import { useEffect, useState } from "react"
import { Image as ImageIcon, Trash2, Plus, Check, X, Loader2 } from "lucide-react"
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
  const [imagenes, setImagenes] = useState<Imagen[]>([])
  const [tipoFilter, setTipoFilter] = useState<string>("todas")
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; imagen: Imagen | null }>({
    open: false,
    imagen: null,
  })
  const [addDialog, setAddDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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

  const handleToggleGaleria = async (imagen: Imagen) => {
    try {
      const res = await fetch(`/api/imagenes/${imagen.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enGaleria: !imagen.enGaleria }),
      })
      if (res.ok) {
        fetchImagenes()
      }
    } catch (error) {
      console.error("Error updating imagen:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.imagen) return
    try {
      const res = await fetch(`/api/imagenes/${deleteDialog.imagen.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchImagenes()
        setDeleteDialog({ open: false, imagen: null })
      }
    } catch (error) {
      console.error("Error deleting imagen:", error)
    }
  }

  const handleAddImagen = async () => {
    if (!formData.url || !formData.nombre) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/imagenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchImagenes()
        setAddDialog(false)
        setFormData({
          url: "",
          nombre: "",
          alt: "",
          tipo: "general",
          enGaleria: false,
        })
      }
    } catch (error) {
      console.error("Error adding imagen:", error)
    } finally {
      setSubmitting(false)
    }
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
          <p className="text-muted-foreground">Gestion de la galeria multimedia</p>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#3D2314]">Galeria de Imagenes</CardTitle>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los tipos</SelectItem>
                <SelectItem value="producto">Producto</SelectItem>
                <SelectItem value="galeria">Galeria</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredImagenes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay imagenes registradas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImagenes.map((imagen) => (
                <Card key={imagen.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    {imagen.url ? (
                      <img
                        src={imagen.url}
                        alt={imagen.alt || imagen.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {imagen.enGaleria && (
                      <div className="absolute top-2 right-2">
                        <Badge style={{ backgroundColor: "#6B8E5A", color: "white" }}>
                          En Galeria
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-[#3D2314] truncate">{imagen.nombre}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant={getTipoBadgeVariant(imagen.tipo)} style={getTipoBadgeStyle(imagen.tipo)}>
                          {imagen.tipo}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleGaleria(imagen)}
                            title={imagen.enGaleria ? "Quitar de galeria" : "Agregar a galeria"}
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
                            onClick={() => setDeleteDialog({ open: true, imagen })}
                            title="Eliminar"
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
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Imagen</DialogTitle>
            <DialogDescription>
              Agrega una nueva imagen proporcionando la URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL de la imagen *</Label>
              <Input
                id="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Nombre descriptivo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Texto alternativo</Label>
              <Input
                id="alt"
                placeholder="Descripcion de la imagen"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
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
                  <SelectItem value="galeria">Galeria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enGaleria"
                checked={formData.enGaleria}
                onCheckedChange={(checked) => setFormData({ ...formData, enGaleria: checked as boolean })}
              />
              <Label htmlFor="enGaleria" className="cursor-pointer">
                Mostrar en galeria publica
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddImagen}
              disabled={!formData.url || !formData.nombre || submitting}
              style={{ backgroundColor: "#3D2314" }}
              className="text-white hover:opacity-90"
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
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, imagen: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Imagen</AlertDialogTitle>
            <AlertDialogDescription>
              Esta seguro que desea eliminar la imagen &quot;{deleteDialog.imagen?.nombre}&quot;?
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
