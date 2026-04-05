// ===========================================
// FINCA LA HABANERA - DATABASE SEED SCRIPT
// ===========================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Solo las credenciales del admin vienen de variables de entorno
// El resto sigue igual como estaba
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@lahabanera.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Habanera2025!';

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ===========================================
  // 1. LIMPIAR DATOS EXISTENTES
  // ===========================================
  console.log('🧹 Limpiando datos existentes...');
  await prisma.mensaje.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.imagen.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.configuracion.deleteMany();
  await prisma.usuario.deleteMany();
  console.log('   ✓ Datos eliminados\n');

  // ===========================================
  // 2. CREAR USUARIO ADMIN
  // ===========================================
  console.log('👤 Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  
  const admin = await prisma.usuario.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      nombre: 'Administrador',
      rol: 'admin',
    },
  });
  console.log(`   ✓ Admin creado: ${admin.email}\n`);

  // ===========================================
  // 3. CREAR CATEGORIAS
  // ===========================================
  console.log('📁 Creando categorias...');
  const categorias = await Promise.all([
    prisma.categoria.create({
      data: {
        nombre: 'Lacteos',
        descripcion: 'Productos lacteos caprinos: quesos, yogures, mantequilla',
      },
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Carne',
        descripcion: 'Carne de cabra para consumo',
      },
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Religiosos',
        descripcion: 'Animales para fines religiosos',
      },
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Pieles',
        descripcion: 'Pieles para artesanias y tambores',
      },
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Abono',
        descripcion: 'Abono organico para agricultura',
      },
    }),
  ]);
  console.log(`   ✓ ${categorias.length} categorias creadas\n`);

  // Encontrar categorias por nombre para los productos
  const lacteosCat = categorias.find((c) => c.nombre === 'Lacteos')!;
  const carneCat = categorias.find((c) => c.nombre === 'Carne')!;
  const religiososCat = categorias.find((c) => c.nombre === 'Religiosos')!;
  const pielesCat = categorias.find((c) => c.nombre === 'Pieles')!;
  const abonoCat = categorias.find((c) => c.nombre === 'Abono')!;

  // ===========================================
  // 4. CREAR PRODUCTOS
  // ===========================================
  console.log('📦 Creando productos...');
  const productos = await Promise.all([
    prisma.producto.create({
      data: {
        nombre: 'Queso de Cabra Fresco',
        descripcion: 'Delicioso queso artesanal elaborado con leche de cabra fresca de nuestra finca. Textura suave y sabor auténtico.',
        imagen: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80',
        activo: true,
        categoriaId: lacteosCat.id,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Yogur Natural',
        descripcion: 'Yogur natural de cabra, cremoso y nutritivo. Sin aditivos artificiales, elaborado con métodos tradicionales.',
        imagen: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
        activo: true,
        categoriaId: lacteosCat.id,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Leche de Cabra',
        descripcion: 'Leche de cabra fresca y pasteurizada. Ideal para personas con intolerancia a la lactosa de leche de vaca.',
        imagen: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80',
        activo: true,
        categoriaId: lacteosCat.id,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Mantequilla Caprina',
        descripcion: 'Mantequilla artesanal de leche de cabra. Sabor suave y delicado, perfecta para cocina y repostería.',
        imagen: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80',
        activo: true,
        categoriaId: lacteosCat.id,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Carne de Cabro',
        descripcion: 'Carne de cabro joven, tierna y de excelente calidad. Criados en pastoreo natural en nuestra finca.',
        imagen: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&q=80',
        activo: true,
        categoriaId: carneCat.id,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Cabrito para Ofrenda',
        descripcion: 'Cabritos sanos y bien cuidados, disponibles para fines religiosos y ceremoniales según tradiciones.',
        imagen: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&q=80',
        activo: true,
        categoriaId: religiososCat.id,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Piel para Tambor',
        descripcion: 'Pieles de cabra curadas artesanalmente, ideales para fabricación de tambores y otros instrumentos musicales.',
        imagen: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&q=80',
        activo: true,
        categoriaId: pielesCat.id,
      },
    }),
    prisma.producto.create({
      data: {
        nombre: 'Abono Organico',
        descripcion: 'Abono orgánico de alta calidad, rico en nutrientes. Ideal para mejorar la fertilidad de suelos agrícolas.',
        imagen: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
        activo: true,
        categoriaId: abonoCat.id,
      },
    }),
  ]);
  console.log(`   ✓ ${productos.length} productos creados\n`);

  // ===========================================
  // 5. CREAR IMAGENES
  // ===========================================
  console.log('🖼️ Creando imagenes...');
  const imagenes = await Promise.all([
    prisma.imagen.create({
      data: {
        url: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=1200&q=80',
        nombre: 'Cabras en Pastoreo',
        alt: 'Grupo de cabras pastando en los campos de Finca La Habanera',
        tipo: 'galeria',
        enGaleria: true,
      },
    }),
    prisma.imagen.create({
      data: {
        url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&q=80',
        nombre: 'Quesos Artesanales',
        alt: 'Variedad de quesos de cabra artesanales',
        tipo: 'galeria',
        enGaleria: true,
      },
    }),
    prisma.imagen.create({
      data: {
        url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
        nombre: 'Vista de la Finca',
        alt: 'Vista panorámica de Finca La Habanera',
        tipo: 'general',
        enGaleria: false,
      },
    }),
    prisma.imagen.create({
      data: {
        url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&q=80',
        nombre: 'Leche Fresca',
        alt: 'Leche de cabra fresca en recipientes tradicionales',
        tipo: 'producto',
        enGaleria: false,
      },
    }),
  ]);
  console.log(`   ✓ ${imagenes.length} imagenes creadas (${imagenes.filter(i => i.enGaleria).length} en galeria)\n`);

  // ===========================================
  // 6. CREAR RESERVAS
  // ===========================================
  console.log('📅 Creando reservas...');
  const reservas = await Promise.all([
    prisma.reserva.create({
      data: {
        nombre: 'María Elena González Pérez',
        email: 'maria.gonzalez@gmail.com',
        telefono: '+53 5 1234567',
        fecha: '2025-02-15',
        personas: 4,
        comentarios: 'Nos gustaría conocer el proceso de elaboración de quesos y comprar algunos productos.',
        estado: 'pendiente',
      },
    }),
    prisma.reserva.create({
      data: {
        nombre: 'Roberto Carlos Fernández',
        email: 'roberto.fernandez@nauta.cu',
        telefono: '+53 5 2345678',
        fecha: '2025-02-20',
        personas: 2,
        comentarios: 'Interesados en el turismo rural, queremos pasar el día y almorzar en la finca.',
        estado: 'pendiente',
      },
    }),
    prisma.reserva.create({
      data: {
        nombre: 'Ana María de la Cruz',
        email: 'ana.cruz@gesic.cu',
        telefono: '+53 5 3456789',
        fecha: '2025-01-25',
        personas: 6,
        comentarios: 'Visita familiar con niños, queremos ver las cabras y el proceso de ordeño.',
        estado: 'confirmada',
      },
    }),
  ]);
  console.log(`   ✓ ${reservas.length} reservas creadas (${reservas.filter(r => r.estado === 'pendiente').length} pendientes, ${reservas.filter(r => r.estado === 'confirmada').length} confirmadas)\n`);

  // ===========================================
  // 7. CREAR MENSAJES
  // ===========================================
  console.log('✉️ Creando mensajes...');
  const mensajes = await Promise.all([
    prisma.mensaje.create({
      data: {
        nombre: 'Carlos Manuel Rodríguez',
        email: 'carlos.r@nauta.cu',
        telefono: '+53 5 4567890',
        asunto: 'Consulta sobre precios mayoristas',
        mensaje: 'Buenos días, represento a un establecimiento gastronómico en La Habana y estamos interesados en establecer una relación comercial para la compra regular de quesos de cabra. ¿Podrían indicarme si manejan precios mayoristas y cuáles serían los volúmenes mínimos de compra? Muchas gracias de antemano.',
        leido: true,
      },
    }),
    prisma.mensaje.create({
      data: {
        nombre: 'Isabel Santos',
        email: 'isabel.santos@gmail.com',
        telefono: '+53 5 5678901',
        asunto: 'Visita con grupo escolar',
        mensaje: 'Hola, soy maestra de una escuela primaria en San José de las Lajas. Me gustaría organizar una visita educativa con un grupo de 25 estudiantes para que conozcan sobre la crianza de cabras y la producción de lácteos. ¿Sería posible coordinar una visita guiada? ¿Qué días y horarios estarían disponibles?',
        leido: false,
      },
    }),
    prisma.mensaje.create({
      data: {
        nombre: 'Juan Pablo Díaz',
        email: 'juan.diaz@infomed.sld.cu',
        telefono: '+53 5 6789012',
        asunto: 'Producto para paciente alérgico',
        mensaje: 'Estimados, soy médico nutricionista y tengo un paciente con alergia severa a la proteína de leche de vaca. He leído que la leche de cabra puede ser una alternativa para algunos pacientes. Me gustaría saber si realizan entregas en La Habana o si es necesario ir personalmente a la finca para adquirir los productos. Quedo atento a su respuesta.',
        leido: false,
      },
    }),
  ]);
  console.log(`   ✓ ${mensajes.length} mensajes creados (${mensajes.filter(m => m.leido).length} leidos, ${mensajes.filter(m => !m.leido).length} sin leer)\n`);

  // ===========================================
  // 8. CREAR CONFIGURACION
  // ===========================================
  console.log('⚙️ Creando configuracion...');
  const config = await prisma.configuracion.create({
    data: {
      telefono: '+53 5 3972047',
      email: 'lahaban3ra@gmail.com',
      whatsapp: '+5353972047',
      instagram: null,
      facebook: null,
      direccion: 'Km 38-1/2, Carretera Central, San Pedro, San Jose de Las Lajas, Mayabeque, Cuba',
    },
  });
  console.log(`   ✓ Configuracion creada: ${config.email}\n`);

  // ===========================================
  // RESUMEN
  // ===========================================
  console.log('═════════════════════════════════════════════════');
  console.log('✅ SEED COMPLETADO EXITOSAMENTE');
  console.log('═════════════════════════════════════════════════');
  console.log('\n📊 Resumen de datos creados:');
  console.log(`   • Usuarios: 1 (${ADMIN_EMAIL})`);
  console.log(`   • Categorias: ${categorias.length}`);
  console.log(`   • Productos: ${productos.length}`);
  console.log(`   • Imagenes: ${imagenes.length}`);
  console.log(`   • Reservas: ${reservas.length}`);
  console.log(`   • Mensajes: ${mensajes.length}`);
  console.log(`   • Configuracion: 1`);
  console.log('\n🔑 Credenciales de administrador:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('═════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });