// Configuración centralizada del Portal
// La URL del CMS se obtiene de variables de entorno

export const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3000';

// Función para obtener datos del CMS
export async function fetchCmsData() {
  try {
    const response = await fetch(`${CMS_URL}/api/public/data`);
    
    if (!response.ok) {
      throw new Error(`Error fetching CMS data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return {
      productos: [],
      categorias: [],
      galeria: [],
      configuracion: {
        telefono: '+53 5 3972047',
        email: 'lahaban3ra@gmail.com',
        whatsapp: '+53 5 3972047',
        direccion: 'Km 38-1/2, Carretera Central, San Pedro, San Jose de Las Lajas, Mayabeque, Cuba',
        instagram: null,
        facebook: null,
      }
    };
  }
}