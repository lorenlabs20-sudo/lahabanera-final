// components/admin/HeroSlidesManager.tsx
"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Plus, Trash2, Edit2, Save, X, GripVertical, Video, Image as ImageIcon, Play, Pause, Maximize, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface HeroSlide {
    id: string
    tipo: 'imagen' | 'video'
    url: string
    titulo: string | null
    subtitulo: string | null
    duracion: number
    orden: number
    activo: boolean
    thumbnail?: string
}

export default function HeroSlidesManager() {
    const { toast } = useToast()
    const [slides, setSlides] = useState<HeroSlide[]>([])
    const [loading, setLoading] = useState(true)
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [previewSlide, setPreviewSlide] = useState<HeroSlide | null>(null)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

    // Video player refs
    const videoRef = useRef<HTMLIFrameElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null)

    // Form state
    const [tipo, setTipo] = useState<'imagen' | 'video'>('imagen')
    const [url, setUrl] = useState('')
    const [titulo, setTitulo] = useState('')
    const [subtitulo, setSubtitulo] = useState('')
    const [duracion, setDuracion] = useState(5)
    const [activo, setActivo] = useState(true)

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            const res = await fetch('/api/hero-slides')
            if (res.ok) {
                const data = await res.json()
                // Generar thumbnails para videos
                const slidesWithThumbnails = await Promise.all(data.slides.map(async (slide: HeroSlide) => {
                    if (slide.tipo === 'video') {
                        const thumbnail = await getVideoThumbnail(slide.url)
                        return { ...slide, thumbnail }
                    }
                    return slide
                }))
                setSlides(slidesWithThumbnails)
            }
        } catch (error) {
            console.error('Error fetching slides:', error)
            toast({ title: "Error", description: "No se pudieron cargar los slides", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const getVideoThumbnail = async (url: string): Promise<string> => {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = ''
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1]?.split('&')[0]
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('/').pop()?.split('?')[0] || ''
            }
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        }

        // Vimeo - requiere fetch a su API
        if (url.includes('vimeo.com')) {
            try {
                const videoId = url.split('/').pop()?.split('?')[0]
                const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
                const data = await response.json()
                return data[0]?.thumbnail_medium || '/placeholder-video.jpg'
            } catch {
                return '/placeholder-video.jpg'
            }
        }

        return '/placeholder-video.jpg'
    }

    const validateUrl = (url: string, tipo: 'imagen' | 'video'): string | null => {
        if (!url) return 'La URL es requerida'

        if (tipo === 'video') {
            const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
            const isVimeo = url.includes('vimeo.com')
            const isDirectVideo = /\.(mp4|webm|ogg)$/i.test(url)

            if (!isYouTube && !isVimeo && !isDirectVideo) {
                return 'URL de video no válida. Soporta YouTube, Vimeo o videos directos (.mp4, .webm, .ogg)'
            }
        }

        return null
    }

    const handleCreate = async () => {
        const urlError = validateUrl(url, tipo)
        if (urlError) {
            toast({ title: "Error", description: urlError, variant: "destructive" })
            return
        }

        if (duracion < 1 || duracion > 30) {
            toast({ title: "Error", description: "La duración debe estar entre 1 y 30 segundos", variant: "destructive" })
            return
        }

        try {
            const res = await fetch('/api/hero-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo,
                    url,
                    titulo: titulo || null,
                    subtitulo: subtitulo || null,
                    duracion,
                    orden: slides.length,
                    activo
                })
            })

            if (res.ok) {
                toast({ title: "Éxito", description: "Slide creado correctamente" })
                resetForm()
                fetchSlides()
                setIsCreating(false)
            } else {
                const error = await res.json()
                toast({ title: "Error", description: error.error, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Error al crear el slide", variant: "destructive" })
        }
    }

    const handleUpdate = async () => {
        if (!editingSlide) return

        const urlError = validateUrl(url, tipo)
        if (urlError) {
            toast({ title: "Error", description: urlError, variant: "destructive" })
            return
        }

        if (duracion < 1 || duracion > 30) {
            toast({ title: "Error", description: "La duración debe estar entre 1 y 30 segundos", variant: "destructive" })
            return
        }

        try {
            const res = await fetch(`/api/hero-slides/${editingSlide.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo,
                    url,
                    titulo: titulo || null,
                    subtitulo: subtitulo || null,
                    duracion,
                    activo
                })
            })

            if (res.ok) {
                toast({ title: "Éxito", description: "Slide actualizado correctamente" })
                resetForm()
                fetchSlides()
                setEditingSlide(null)
            } else {
                const error = await res.json()
                toast({ title: "Error", description: error.error, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Error al actualizar el slide", variant: "destructive" })
        }
    }

    const openDeleteModal = (slide: HeroSlide) => {
        setSlideToDelete(slide)
        setDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!slideToDelete) return

        try {
            const res = await fetch(`/api/hero-slides/${slideToDelete.id}`, { method: 'DELETE' })
            if (res.ok) {
                toast({ title: "Éxito", description: "Slide eliminado correctamente" })
                fetchSlides()
                setDeleteModalOpen(false)
                setSlideToDelete(null)
            } else {
                const error = await res.json()
                toast({ title: "Error", description: error.error, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Error al eliminar el slide", variant: "destructive" })
        }
    }

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())

        // Añadir efecto visual al elemento arrastrado
        const target = e.target as HTMLElement
        const card = target.closest('.slide-card')
        if (card) {
            card.classList.add('opacity-50')
        }
    }

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedIndex(null)
        setDragOverIndex(null)

        // Remover efectos visuales
        const cards = document.querySelectorAll('.slide-card')
        cards.forEach(card => {
            card.classList.remove('opacity-50', 'border-2', 'border-[#3D2314]', 'scale-105')
        })
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        setDragOverIndex(index)

        // Efecto visual en el destino
        const target = e.target as HTMLElement
        const card = target.closest('.slide-card')
        if (card) {
            const cards = document.querySelectorAll('.slide-card')
            cards.forEach(c => c.classList.remove('border-2', 'border-[#3D2314]', 'scale-105'))
            card.classList.add('border-2', 'border-[#3D2314]', 'scale-105', 'transition-all', 'duration-200')
        }
    }

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()

        if (draggedIndex === null || draggedIndex === dropIndex) {
            handleDragEnd(e)
            return
        }

        // Realizar el reordenamiento con animación
        const newSlides = [...slides]
        const [draggedSlide] = newSlides.splice(draggedIndex, 1)
        newSlides.splice(dropIndex, 0, draggedSlide)

        // Actualizar órdenes
        const updatedSlides = newSlides.map((slide, index) => ({ ...slide, orden: index }))

        // Animar el cambio
        setSlides(updatedSlides)

        // Guardar en el servidor
        try {
            for (const slide of updatedSlides) {
                await fetch(`/api/hero-slides/${slide.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orden: slide.orden })
                })
            }
            toast({ title: "Éxito", description: "Orden actualizado correctamente" })
        } catch (error) {
            toast({ title: "Error", description: "Error al actualizar el orden", variant: "destructive" })
            // Revertir cambios si falla
            fetchSlides()
        }

        handleDragEnd(e)
    }

    const resetForm = () => {
        setTipo('imagen')
        setUrl('')
        setTitulo('')
        setSubtitulo('')
        setDuracion(5)
        setActivo(true)
    }

    const editSlide = (slide: HeroSlide) => {
        setEditingSlide(slide)
        setTipo(slide.tipo)
        setUrl(slide.url)
        setTitulo(slide.titulo || '')
        setSubtitulo(slide.subtitulo || '')
        setDuracion(slide.duracion)
        setActivo(slide.activo)
        setIsCreating(false)
    }

    const getEmbedUrl = (slide: HeroSlide, autoplay: boolean = false): string => {
        if (slide.tipo === 'imagen') return slide.url

        if (slide.url.includes('youtube.com')) {
            const videoId = slide.url.split('v=')[1]?.split('&')[0]
            return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&enablejsapi=1`
        }

        if (slide.url.includes('youtu.be')) {
            const videoId = slide.url.split('/').pop()?.split('?')[0]
            return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&enablejsapi=1`
        }

        if (slide.url.includes('vimeo.com')) {
            const videoId = slide.url.split('/').pop()?.split('?')[0]
            return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&muted=${isMuted ? 1 : 0}&controls=1`
        }

        return slide.url
    }

    const togglePlayPause = () => {
        if (videoRef.current && videoRef.current.contentWindow) {
            const message = isPlaying ? 'pause' : 'play'
            videoRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: message, args: [] }),
                '*'
            )
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
        if (videoRef.current && videoRef.current.contentWindow) {
            const message = isMuted ? 'unMute' : 'mute'
            videoRef.current.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: message, args: [] }),
                '*'
            )
        }
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D2314]"></div>
                <p className="mt-2 text-muted-foreground">Cargando slides...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#3D2314]">Slides Promocionales</h2>
                    <p className="text-sm text-muted-foreground">Gestiona el carrusel de la página principal</p>
                </div>
                {!isCreating && !editingSlide && (
                    <Button onClick={() => setIsCreating(true)} className="bg-[#3D2314] hover:bg-[#2a180e]">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Slide
                    </Button>
                )}
            </div>

            {/* Formulario de creación/edición */}
            {(isCreating || editingSlide) && (
                <Card className="animate-in slide-in-from-top duration-300">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-[#3D2314]">
                                    {editingSlide ? 'Editar Slide' : 'Nuevo Slide'}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsCreating(false)
                                        setEditingSlide(null)
                                        resetForm()
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Tipo de slide */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTipo('imagen')}
                                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${tipo === 'imagen'
                                        ? 'border-[#3D2314] bg-[#3D2314]/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <ImageIcon className="w-6 h-6 mx-auto mb-2 text-[#3D2314]" />
                                    <span className="text-sm font-medium">Imagen</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipo('video')}
                                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${tipo === 'video'
                                        ? 'border-[#3D2314] bg-[#3D2314]/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Video className="w-6 h-6 mx-auto mb-2 text-[#3D2314]" />
                                    <span className="text-sm font-medium">Video</span>
                                </button>
                            </div>

                            {/* URL */}
                            <div className="space-y-2">
                                <Label htmlFor="url">
                                    {tipo === 'imagen' ? 'URL de la imagen' : 'URL del video'}
                                </Label>
                                <Input
                                    id="url"
                                    type="url"
                                    placeholder={tipo === 'imagen'
                                        ? "https://ejemplo.com/imagen.jpg"
                                        : "https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                                    }
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {tipo === 'video' && "Soporta YouTube, Vimeo o videos directos (.mp4, .webm, .ogg)"}
                                </p>
                            </div>

                            {/* Título y subtítulo */}
                            <div className="space-y-2">
                                <Label htmlFor="titulo">Título (opcional)</Label>
                                <Input
                                    id="titulo"
                                    placeholder="Título del slide"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subtitulo">Subtítulo (opcional)</Label>
                                <Textarea
                                    id="subtitulo"
                                    placeholder="Subtítulo del slide"
                                    value={subtitulo}
                                    onChange={(e) => setSubtitulo(e.target.value)}
                                    rows={2}
                                />
                            </div>

                            {/* Duración */}
                            <div className="space-y-2">
                                <Label htmlFor="duracion">Duración (segundos)</Label>
                                <Input
                                    id="duracion"
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={duracion}
                                    onChange={(e) => setDuracion(parseInt(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Tiempo que se mostrará este slide antes de cambiar al siguiente (1-30 segundos)
                                </p>
                            </div>

                            {/* Activo */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="activo">Slide activo</Label>
                                <Switch
                                    id="activo"
                                    checked={activo}
                                    onCheckedChange={setActivo}
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-2 justify-end pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreating(false)
                                        setEditingSlide(null)
                                        resetForm()
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={editingSlide ? handleUpdate : handleCreate}
                                    className="bg-[#3D2314] hover:bg-[#2a180e]"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingSlide ? 'Actualizar' : 'Crear'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de slides */}
            <div className="space-y-3">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`slide-card transition-all duration-300 ${dragOverIndex === index ? 'scale-105 shadow-lg' : ''
                            }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <Card className="relative group hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Drag handle */}
                                    <div className="cursor-move text-gray-400 hover:text-gray-600">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    {/* Preview con miniatura mejorada */}
                                    <div className="flex-shrink-0 w-32 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative group/preview"
                                        onClick={() => setPreviewSlide(slide)}>
                                        {slide.tipo === 'imagen' ? (
                                            <img
                                                src={slide.url}
                                                alt={slide.titulo || 'Slide preview'}
                                                className="w-full h-full object-cover transition-transform group-hover/preview:scale-110"
                                            />
                                        ) : (
                                            <>
                                                {slide.thumbnail ? (
                                                    <img
                                                        src={slide.thumbnail}
                                                        alt={slide.titulo || 'Video preview'}
                                                        className="w-full h-full object-cover transition-transform group-hover/preview:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                        <Video className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                                    <Play className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                                    Video
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {slide.tipo === 'imagen' ? (
                                                <ImageIcon className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <Video className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className="text-sm font-medium text-[#3D2314]">
                                                {slide.titulo || `Slide ${index + 1}`}
                                            </span>
                                            {!slide.activo && (
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>
                                        {slide.subtitulo && (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {slide.subtitulo}
                                            </p>
                                        )}
                                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                            <span>Duración: {slide.duracion}s</span>
                                            <span>Orden: {slide.orden}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setPreviewSlide(slide)}
                                            className="h-8 w-8 p-0"
                                            title="Vista previa"
                                        >
                                            <Play className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editSlide(slide)}
                                            className="h-8 w-8 p-0"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDeleteModal(slide)}
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}

                {slides.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No hay slides creados. ¡Crea tu primer slide promocional!
                    </div>
                )}
            </div>

            {/* Modal de preview mejorado con controles funcionales */}
            {previewSlide && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
                    onClick={() => {
                        setPreviewSlide(null)
                        setIsPlaying(false)
                    }}
                >
                    <div
                        className="relative max-w-5xl w-full animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header del modal */}
                        <div className="absolute -top-12 left-0 right-0 flex justify-between items-center text-white">
                            <div>
                                <h3 className="font-semibold text-lg">{previewSlide.titulo || 'Vista previa'}</h3>
                                {previewSlide.subtitulo && (
                                    <p className="text-sm text-gray-300">{previewSlide.subtitulo}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {previewSlide.tipo === 'video' && (
                                    <>
                                        <button
                                            onClick={togglePlayPause}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                            title={isPlaying ? 'Pausar' : 'Reproducir'}
                                        >
                                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={toggleMute}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                            title={isMuted ? 'Activar sonido' : 'Silenciar'}
                                        >
                                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        const url = getEmbedUrl(previewSlide)
                                        window.open(url, '_blank')
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Abrir en nueva ventana"
                                >
                                    <Maximize className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setPreviewSlide(null)
                                        setIsPlaying(false)
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Cerrar"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                            {previewSlide.tipo === 'imagen' ? (
                                <img
                                    src={previewSlide.url}
                                    alt={previewSlide.titulo || 'Preview'}
                                    className="w-full h-auto max-h-[80vh] object-contain"
                                />
                            ) : (
                                <div className="relative pb-[56.25%]">
                                    <iframe
                                        ref={videoRef}
                                        src={getEmbedUrl(previewSlide, true)}
                                        className="absolute top-0 left-0 w-full h-full"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        onLoad={() => setIsPlaying(true)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Información del slide */}
                        <div className="mt-4 text-white text-center">
                            <p className="text-sm text-gray-300">
                                Duración: {previewSlide.duracion} segundos |
                                Tipo: {previewSlide.tipo === 'imagen' ? 'Imagen' : 'Video'} |
                                Estado: {previewSlide.activo ? 'Activo' : 'Inactivo'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el slide "{slideToDelete?.titulo || 'sin título'}"?
                            <br />
                            <span className="text-red-500 text-sm mt-2 block">
                                Esta acción no se puede deshacer.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteModalOpen(false)
                                setSlideToDelete(null)
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}