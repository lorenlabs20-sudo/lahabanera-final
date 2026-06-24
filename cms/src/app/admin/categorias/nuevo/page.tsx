"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function NuevaCategoriaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ nombre?: string }>({})
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

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

    setLoading(true)
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
        }),
      })

      if (res.ok) {
        toast({
          title: "Categoría creada",
          description: `La categoría "${formData.nombre}" ha sido creada exitosamente`,
          variant: "default",
        })
        router.push("/admin/categorias")
      } else {
        const error = await res.json()
        toast({
          title: "Error al crear categoría",
          description: error.error || "No se pudo crear la categoría",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating categoria:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-4 sm:space-y-6">
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
          <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Nueva Categoría</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Crear una nueva categoría de productos
          </p>
        </div>
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#3D2314" }}
                className="w-full sm:w-auto text-white hover:opacity-90 order-1 sm:order-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Categoría
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