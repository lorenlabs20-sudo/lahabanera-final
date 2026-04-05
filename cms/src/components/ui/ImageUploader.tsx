"use client"

import { useState, useEffect } from "react"
import { Loader2, Image as ImageIcon, Check, X, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Configuración de Cloudinary
const cloudinaryConfig = {
    cloudName: "dwad8nrdl",
    uploadPreset: "SoldMax_Ventas",
}

interface ImageUploaderProps {
    onUploadSuccess: (url: string, publicId: string) => void
    onUploadError?: (error: string) => void
    onImageRemove?: () => void  // NUEVO: callback específico para cuando se quita la imagen
    tipo?: string
    initialImage?: { url: string; publicId: string }
    isEditing?: boolean
}

export function ImageUploader({
    onUploadSuccess,
    onUploadError,
    onImageRemove,  // NUEVO
    tipo = "general",
    initialImage,
    isEditing = false
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState<string>("")
    const [uploadedPublicId, setUploadedPublicId] = useState<string>("")

    // Cargar imagen inicial si existe (para edición)
    useEffect(() => {
        if (initialImage && initialImage.url) {
            setPreview(initialImage.url)
            setUploadedUrl(initialImage.url)
            setUploadedPublicId(initialImage.publicId)
            setSuccess(true)
        } else if (!isEditing) {
            setPreview(null)
            setUploadedUrl("")
            setUploadedPublicId("")
            setSuccess(false)
        }
    }, [initialImage, isEditing])

    const uploadImageToCloudinary = async (file: File) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"]
        if (!allowedTypes.includes(file.type)) {
            throw new Error("Formato no válido. Use JPG, PNG, GIF o WEBP")
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error("La imagen no debe exceder 5MB")
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", cloudinaryConfig.uploadPreset)
        formData.append("folder", `la-habanera/${tipo}`)

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        )

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || "Error al subir la imagen")
        }

        const data = await response.json()

        const optimizedUrl = data.secure_url.replace(
            "/upload/",
            "/upload/q_auto,f_auto,w_800,c_scale/"
        )

        return {
            url: optimizedUrl,
            publicId: data.public_id,
            originalUrl: data.secure_url,
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)
        setSuccess(false)
        setUploading(true)

        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        try {
            const result = await uploadImageToCloudinary(file)
            setSuccess(true)
            setUploadedUrl(result.url)
            setUploadedPublicId(result.publicId)
            onUploadSuccess(result.url, result.publicId)
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Error al subir la imagen"
            setError(errorMsg)
            onUploadError?.(errorMsg)
            setPreview(null)
            setUploadedUrl("")
            setUploadedPublicId("")
        } finally {
            setUploading(false)
            e.target.value = ""
        }
    }

    const clearPreview = () => {
        setPreview(null)
        setError(null)
        setSuccess(false)
        setUploadedUrl("")
        setUploadedPublicId("")
        // NO llamar a onUploadSuccess con strings vacíos
        // Mejor llamar a un callback específico para remover
        if (onImageRemove) {
            onImageRemove()
        }
    }

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 text-center transition-all",
                    uploading && "opacity-50 cursor-not-allowed",
                    error && "border-red-500 bg-red-50",
                    success && "border-green-500 bg-green-50",
                    !error && !success && "border-gray-300 hover:border-[#D4A574]"
                )}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                        {!uploading && (
                            <button
                                onClick={clearPreview}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Quitar imagen"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        {success && !uploading && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                                <Check className="w-4 h-4" />
                            </div>
                        )}
                        <p className="text-xs text-center mt-2 text-green-600">
                            ✓ Imagen cargada correctamente
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-center">
                            <div className="p-3 bg-[#FFF8F0] rounded-full">
                                <ImageIcon className="w-8 h-8 text-[#D4A574]" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="image-upload" className="cursor-pointer">
                                <span className="text-[#D4A574] font-medium">Haz clic para subir</span>
                                <span className="text-muted-foreground"> o arrastra y suelta</span>
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG, GIF, WEBP hasta 5MB
                            </p>
                        </div>
                        <Input
                            id="image-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                        />
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4A574]" />
                        <p className="text-sm text-muted-foreground mt-2">Subiendo imagen...</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}