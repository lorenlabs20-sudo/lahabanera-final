"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
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

interface Categoria {
  id: string
  nombre: string
}

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  imagen: string | null
  activo: boolean
  categoriaId: string
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const productoId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    imagen: "",
    categoriaId: "",
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
        setCategorias(data)
      }
    } catch (error) {
      console.error("Error fetching categorias:", error)
    }
  }

  const fetchProducto = async () => {
    try {
      const res = await fetch(`/api/productos/${productoId}`)
      if (res.ok) {
        const producto: Producto = await res.json()
        setFormData({
          nombre: producto.nombre,
          descripcion: producto.descripcion || "",
          imagen: producto.imagen || "",
          categoriaId: producto.categoriaId,
          activo: producto.activo,
        })
      } else {
        alert("Producto no encontrado")
        router.push("/admin/productos")
      }
    } catch (error) {
      console.error("Error fetching producto:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      alert("El nombre es requerido")
      return
    }
    
    if (!formData.categoriaId) {
      alert("Debe seleccionar una categoria")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/productos/${productoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          imagen: formData.imagen || null,
          categoriaId: formData.categoriaId,
          activo: formData.activo,
        }),
      })

      if (res.ok) {
        router.push("/admin/productos")
      } else {
        const error = await res.json()
        alert(error.error || "Error al actualizar el producto")
      }
    } catch (error) {
      console.error("Error updating producto:", error)
      alert("Error al actualizar el producto")
    } finally {
      setSaving(false)
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/productos")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#3D2314]">Editar Producto</h1>
          <p className="text-muted-foreground">Modificar la informacion del producto</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#3D2314]">Informacion del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoriaId}
                  onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripcion del producto"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagen">URL de la Imagen</Label>
              <Input
                id="imagen"
                value={formData.imagen}
                onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-sm text-muted-foreground">
                Ingrese la URL de la imagen del producto
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
              <Label htmlFor="activo">Producto activo</Label>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/productos")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                style={{ backgroundColor: "#3D2314" }}
                className="text-white hover:opacity-90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
