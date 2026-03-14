"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
}

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const categoriaId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

  useEffect(() => {
    fetchCategoria()
  }, [categoriaId])

  const fetchCategoria = async () => {
    try {
      const res = await fetch(`/api/categorias/${categoriaId}`)
      if (res.ok) {
        const categoria: Categoria = await res.json()
        setFormData({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion || "",
        })
      } else {
        alert("Categoria no encontrada")
        router.push("/admin/categorias")
      }
    } catch (error) {
      console.error("Error fetching categoria:", error)
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

    setSaving(true)
    try {
      const res = await fetch(`/api/categorias/${categoriaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
        }),
      })

      if (res.ok) {
        router.push("/admin/categorias")
      } else {
        const error = await res.json()
        alert(error.error || "Error al actualizar la categoria")
      }
    } catch (error) {
      console.error("Error updating categoria:", error)
      alert("Error al actualizar la categoria")
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
          onClick={() => router.push("/admin/categorias")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#3D2314]">Editar Categoria</h1>
          <p className="text-muted-foreground">Modificar la informacion de la categoria</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#3D2314]">Informacion de la Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Nombre de la categoria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripcion de la categoria"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/categorias")}
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
