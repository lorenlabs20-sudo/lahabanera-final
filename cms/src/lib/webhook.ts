// ===========================================
// WEBHOOK SERVICE - Trigger Portal Rebuild
// ===========================================

export async function triggerPortalRebuild(options: {
  reason: string
  entity?: string
  entityId?: string
}): Promise<boolean> {
  console.log('==========================================')
  console.log('[WEBHOOK] DISPARADO!')
  console.log('[WEBHOOK] Razón:', options.reason)
  console.log('[WEBHOOK] Entity:', options.entity)
  console.log('[WEBHOOK] EntityId:', options.entityId)
  console.log('==========================================')
  
  const webhookUrl = process.env.PORTAL_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.log('[WEBHOOK] No hay PORTAL_WEBHOOK_URL configurada')
    return false
  }
  
  console.log('[WEBHOOK] URL:', webhookUrl)
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: options.reason,
        entity: options.entity,
        entityId: options.entityId,
        timestamp: new Date().toISOString(),
      }),
    })
    
    console.log('[WEBHOOK] Response:', response.status)
    return response.ok
  } catch (error) {
    console.error('[WEBHOOK] Error:', error)
    return false
  }
}

export const webhookTriggers = {
  productoCreado: (id: string) => 
    triggerPortalRebuild({ reason: 'Producto creado', entity: 'producto', entityId: id }),
  
  productoActualizado: (id: string) => 
    triggerPortalRebuild({ reason: 'Producto actualizado', entity: 'producto', entityId: id }),
  
  productoEliminado: (id: string) => 
    triggerPortalRebuild({ reason: 'Producto eliminado', entity: 'producto', entityId: id }),
  
  categoriaCreada: (id: string) => 
    triggerPortalRebuild({ reason: 'Categoría creada', entity: 'categoria', entityId: id }),
  
  categoriaActualizada: (id: string) => 
    triggerPortalRebuild({ reason: 'Categoría actualizada', entity: 'categoria', entityId: id }),
  
  categoriaEliminada: (id: string) => 
    triggerPortalRebuild({ reason: 'Categoría eliminada', entity: 'categoria', entityId: id }),
  
  imagenCreada: (id: string) => 
    triggerPortalRebuild({ reason: 'Imagen agregada', entity: 'imagen', entityId: id }),
  
  imagenEliminada: (id: string) => 
    triggerPortalRebuild({ reason: 'Imagen eliminada', entity: 'imagen', entityId: id }),
  
  configuracionActualizada: () => 
    triggerPortalRebuild({ reason: 'Configuración actualizada', entity: 'configuracion' }),
}