"use client"

import { useEffect, useState } from "react"
import { Settings, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import HeroSlidesManager from "@/components/ui/HeroSlidesManager"

interface Configuracion {
  id: string
  telefono: string
  email: string
  whatsapp: string
  instagram: string | null
  facebook: string | null
  direccion: string
}

interface FormErrors {
  telefono?: string
  email?: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  direccion?: string
}

export default function ConfiguracionPage() {
  const { toast } = useToast()
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

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
      } else {
        throw new Error("Error al cargar la configuración")
      }
    } catch (error) {
      console.error("Error fetching configuracion:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Validaciones
  const validateTelefono = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, telefono: "El teléfono es requerido" }))
      return false
    }
    // Permite formatos: +53 5 1234567, 5351234567, +5351234567, etc.
    const telefonoRegex = /^[\+\d\s\-\(\)]{8,20}$/
    if (!telefonoRegex.test(value)) {
      setErrors(prev => ({ ...prev, telefono: "Ingrese un número de teléfono válido" }))
      return false
    }
    setErrors(prev => ({ ...prev, telefono: undefined }))
    return true
  }

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, email: "El email es requerido" }))
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: "Ingrese un email válido (ejemplo@dominio.com)" }))
      return false
    }
    setErrors(prev => ({ ...prev, email: undefined }))
    return true
  }

  const validateWhatsapp = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, whatsapp: "El WhatsApp es requerido" }))
      return false
    }
    // Solo números, puede incluir código de país
    const whatsappRegex = /^\d{6,15}$/
    if (!whatsappRegex.test(value.replace(/\s/g, ''))) {
      setErrors(prev => ({ ...prev, whatsapp: "Ingrese solo números (ejemplo: 5353972047)" }))
      return false
    }
    setErrors(prev => ({ ...prev, whatsapp: undefined }))
    return true
  }

  const validateInstagram = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, instagram: undefined }))
      return true // Opcional, no hay error
    }
    // Validar URL de Instagram o nombre de usuario
    const instagramUrlRegex = /^(https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+(\/)?)$|^@?[A-Za-z0-9_.]{1,30}$/
    if (!instagramUrlRegex.test(value)) {
      setErrors(prev => ({ ...prev, instagram: "Ingrese una URL válida de Instagram o nombre de usuario" }))
      return false
    }
    setErrors(prev => ({ ...prev, instagram: undefined }))
    return true
  }

  const validateFacebook = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, facebook: undefined }))
      return true // Opcional, no hay error
    }
    // Validar URL de Facebook
    const facebookUrlRegex = /^(https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9.]+(\/)?)$|^(https?:\/\/(www\.)?fb\.com\/[A-Za-z0-9.]+(\/)?)$/
    if (!facebookUrlRegex.test(value)) {
      setErrors(prev => ({ ...prev, facebook: "Ingrese una URL válida de Facebook" }))
      return false
    }
    setErrors(prev => ({ ...prev, facebook: undefined }))
    return true
  }

  const validateDireccion = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, direccion: "La dirección es requerida" }))
      return false
    }
    if (value.length < 10) {
      setErrors(prev => ({ ...prev, direccion: "La dirección debe tener al menos 10 caracteres" }))
      return false
    }
    if (value.length > 500) {
      setErrors(prev => ({ ...prev, direccion: "La dirección no puede exceder los 500 caracteres" }))
      return false
    }
    setErrors(prev => ({ ...prev, direccion: undefined }))
    return true
  }

  const validateForm = (): boolean => {
    const isTelefonoValid = validateTelefono(telefono)
    const isEmailValid = validateEmail(email)
    const isWhatsappValid = validateWhatsapp(whatsapp)
    const isInstagramValid = validateInstagram(instagram)
    const isFacebookValid = validateFacebook(facebook)
    const isDireccionValid = validateDireccion(direccion)

    return isTelefonoValid && isEmailValid && isWhatsappValid && isInstagramValid && isFacebookValid && isDireccionValid
  }

  const handleSave = async () => {
    // Validar todos los campos antes de guardar
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrija los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono: telefono.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          instagram: instagram.trim() || null,
          facebook: facebook.trim() || null,
          direccion: direccion.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setConfiguracion(data.configuracion)
        toast({
          title: "Configuración guardada",
          description: "Los cambios se han guardado correctamente",
        })
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo guardar la configuración",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving configuracion:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#3D2314]">Configuración</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Edita los datos de contacto del sitio</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E8E4D9" }}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2314]" />
            </div>
            <div>
              <CardTitle className="text-[#3D2314] text-lg sm:text-xl">Datos de Contacto</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Esta información se mostrará en el sitio web público
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-[#3D2314]">
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+53 5 3972047"
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value)
                  if (errors.telefono) validateTelefono(e.target.value)
                }}
                onBlur={() => validateTelefono(telefono)}
                className={`border-[#E8E4D9] focus-visible:ring-[#D4A574] ${errors.telefono ? "border-red-500" : ""
                  }`}
              />
              {errors.telefono && (
                <p className="text-xs text-red-500">{errors.telefono}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#3D2314]">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="lahaban3ra@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) validateEmail(e.target.value)
                }}
                onBlur={() => validateEmail(email)}
                className={`border-[#E8E4D9] focus-visible:ring-[#D4A574] ${errors.email ? "border-red-500" : ""
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-[#3D2314]">
                WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="5353972047"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value)
                  if (errors.whatsapp) validateWhatsapp(e.target.value)
                }}
                onBlur={() => validateWhatsapp(whatsapp)}
                className={`border-[#E8E4D9] focus-visible:ring-[#D4A574] ${errors.whatsapp ? "border-red-500" : ""
                  }`}
              />
              {errors.whatsapp && (
                <p className="text-xs text-red-500">{errors.whatsapp}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Solo números, sin el símbolo + (ejemplo: 5353972047)
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
                placeholder="https://instagram.com/... o @usuario"
                value={instagram || ""}
                onChange={(e) => {
                  setInstagram(e.target.value)
                  if (errors.instagram) validateInstagram(e.target.value)
                }}
                onBlur={() => validateInstagram(instagram)}
                className={`border-[#E8E4D9] focus-visible:ring-[#D4A574] ${errors.instagram ? "border-red-500" : ""
                  }`}
              />
              {errors.instagram && (
                <p className="text-xs text-red-500">{errors.instagram}</p>
              )}
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
                onChange={(e) => {
                  setFacebook(e.target.value)
                  if (errors.facebook) validateFacebook(e.target.value)
                }}
                onBlur={() => validateFacebook(facebook)}
                className={`border-[#E8E4D9] focus-visible:ring-[#D4A574] ${errors.facebook ? "border-red-500" : ""
                  }`}
              />
              {errors.facebook && (
                <p className="text-xs text-red-500">{errors.facebook}</p>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion" className="text-[#3D2314]">
              Dirección <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="direccion"
              placeholder="Km 38-1/2, Carretera Central, San Pedro, San Jose de Las Lajas, Mayabeque, Cuba"
              value={direccion}
              onChange={(e) => {
                setDireccion(e.target.value)
                if (errors.direccion) validateDireccion(e.target.value)
              }}
              onBlur={() => validateDireccion(direccion)}
              rows={3}
              className={`border-[#E8E4D9] focus-visible:ring-[#D4A574] resize-none ${errors.direccion ? "border-red-500" : ""
                }`}
            />
            {errors.direccion && (
              <p className="text-xs text-red-500">{errors.direccion}</p>
            )}
          </div>

          {/* Campos requeridos indicador */}
          <div className="text-xs text-muted-foreground">
            <span className="text-red-500">*</span> Campos requeridos
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-[#E8E4D9]">
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: "#3D2314" }}
              className="text-white hover:opacity-90 min-w-[150px] w-full sm:w-auto"
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

      <Card>
        <CardHeader>
          <CardTitle>Carrusel Principal</CardTitle>
          <CardDescription>
            Gestiona los slides que se muestran en la página de inicio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroSlidesManager />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-[#E8E4D9] border-none">
        <CardContent className="pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#D4A574" }}
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-[#3D2314]" />
            </div>
            <div className="text-xs sm:text-sm text-[#3D2314]">
              <p className="font-medium mb-1">Información</p>
              <p className="text-muted-foreground">
                Los cambios realizados aquí se reflejarán inmediatamente en el sitio web público.
                El número de WhatsApp se utilizará para el botón de contacto flotante.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}