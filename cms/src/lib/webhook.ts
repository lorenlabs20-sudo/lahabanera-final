// ===========================================
// WEBHOOK SERVICE - Trigger Portal Rebuild
// ===========================================

export async function triggerPortalRebuild(options: {
  reason: string
  entity?: string
  entityId?: string
}): Promise<boolean> {
  const webhookUrl = process.env.PORTAL_WEBHOOK_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // 1. Validación estricta de configuración
  if (!webhookUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WEBHOOK] PORTAL_WEBHOOK_URL no configurada');
    }
    return false;
  }

  if (!webhookSecret) {
    console.error('ERROR CRÍTICO: WEBHOOK_SECRET no definida. El webhook no se enviará por seguridad.');
    return false;
  }

  try {
    // 2. Envío seguro con encabezado de autenticación
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-webhook-secret': webhookSecret,
      'User-Agent': 'Portal-Seguro/1.0',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        reason: options.reason,
        entity: options.entity,
        entityId: options.entityId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[WEBHOOK] Error ${response.status}: Falló el rebuild`);
      }
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[WEBHOOK] Rebuild disparado con éxito:', options.reason);
    }

    return true;
  } catch (error) {
    console.error('[WEBHOOK] Excepción al disparar rebuild:', error instanceof Error ? error.message : 'Error desconocido');
    return false;
  }
}

// ===========================================
// TRIGGERS ESPECÍFICOS
// ===========================================
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
};
