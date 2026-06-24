import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('Faltan variables de entorno para inicializar el admin.');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: { 
      password: hashedPassword,
      rol: 'admin',
      nombre: 'Administrador'
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      rol: 'admin',
      nombre: 'Administrador',
    },
  });

  console.log('Admin inicializado/actualizado:', admin.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());