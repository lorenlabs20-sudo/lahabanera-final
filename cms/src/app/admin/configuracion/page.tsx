"use client"

import { useEffect, useState } from "react"
import { Settings, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Configuracion {
  id: string
  telefono: string
  email: string
  whatsapp: string
  instagram: string | null
  facebook: string | null
  direccion: string
}

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [direccion, setDireccion] = useState("")

  useEffect(() => {
    fetchConfiguracion()
  }, [])

  const fetchConfiguracion = async () => {
    try {
      const res = await fetch("/api/configuracion")
      if (res.ok) {
        const data = await res.json()
        setConfiguracion(data.configuracion)
        setTelefono(data.configuracion.telefono || "")
        setEmail(data.configuracion.email || "")
        setWhatsapp(data.configuracion.whatsapp || "")
        setInstagram(data.configuracion.instagram || "")
        setFacebook(data.configuracion.facebook || "")
        setDireccion(data.configuracion.direccion || "")
      }
    } catch (error) {
      console.error("Error fetching configuracion:", error)
      toast.error("Error al cargar la configuracion")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono,
          email,
          whatsapp,
          instagram: instagram || null,
          facebook: facebook || null,
          direccion,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setConfiguracion(data.configuracion)
        toast.success("Configuracion guardada correctamente")
      } else {
        const error = await res.json()
        toast.error(error.error || "Error al guardar la configuracion")
      }
    } catch (error) {
      console.error("Error saving configuracion:", error)
      toast.error("Error al guardar la configuracion")
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3D2314]">Configuracion</h1>
        <p className="text-muted-foreground">Edita los datos de contacto del sitio</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E8E4D9" }}
            >
              <Settings className="w-5 h-5 text-[#3D2314]" />
            </div>
            <div>
              <CardTitle className="text-[#3D2314]">Datos de Contacto</CardTitle>
              <CardDescription>
                Esta informacion se mostrara en el sitio web publico
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Telefono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-[#3D2314]">
                Telefono
              </Label>
              <Input
                id="telefono"
                type="text"
                placeholder="+53 5 3972047"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="border-[#E8E4D9] focus-visible:ring-[#D4A574]"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#3D2314]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="lahaban3ra@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#E8E4D9] focus-visible:ring-[#D4A574]"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-[#3D2314]">
                WhatsApp
              </Label>
              <Input
                id="whatsapp"
                type="text"
                placeholder="5353972047"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="border-[#E8E4D9] focus-visible:ring-[#D4A574]"
              />
              <p className="text-xs text-muted-foreground">
                Numero sin el simbolo + (ejemplo: 5353972047)
              </p>
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-[#3D2314]">
                Instagram (opcional)
              </Label>
              <Input
                id="instagram"
                type="text"
                placeholder="https://instagram.com/..."
                value={instagram || ""}
                onChange={(e) => setInstagram(e.target.value)}
                className="border-[#E8E4D9] focus-visible:ring-[#D4A574]"
              />
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook" className="text-[#3D2314]">
                Facebook (opcional)
              </Label>
              <Input
                id="facebook"
                type="text"
                placeholder="https://facebook.com/..."
                value={facebook || ""}
                onChange={(e) => setFacebook(e.target.value)}
                className="border-[#E8E4D9] focus-visible:ring-[#D4A574]"
              />
            </div>
          </div>

          {/* Direccion */}
          <div className="space-y-2">
            <Label htmlFor="direccion" className="text-[#3D2314]">
              Direccion
            </Label>
            <Textarea
              id="direccion"
              placeholder="Km 38-1/2, Carretera Central, San Pedro, San Jose de Las Lajas, Mayabeque, Cuba"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              rows={3}
              className="border-[#E8E4D9] focus-visible:ring-[#D4A574] resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-[#E8E4D9]">
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: "#3D2314" }}
              className="text-white hover:opacity-90 min-w-[150px]"
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
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-[#E8E4D9] border-none">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#D4A574" }}
            >
              <Settings className="w-4 h-4 text-[#3D2314]" />
            </div>
            <div className="text-sm text-[#3D2314]">
              <p className="font-medium mb-1">Informacion</p>
              <p className="text-muted-foreground">
                Los cambios realizados aqui se reflejaran inmediatamente en el sitio web publico. 
                El numero de WhatsApp se utilizara para el boton de contacto flotante.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
