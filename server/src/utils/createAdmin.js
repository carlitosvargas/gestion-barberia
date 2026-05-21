const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'carloscabj8@gmail.com';
  const password = 'admin123';
  const nombre = 'Carlos';
  const apellido = 'Vargas';
  const telefono = '3794404617';

  const passwordHasheada = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        telefono,
        email,
        password: passwordHasheada,
        rol: 'SUPER_ADMIN',
      },
    });
    console.log('-----------------------------------------');
    console.log('✅ Super Admin creado con éxito');
    console.log(`👤 Nombre: ${admin.nombre} ${admin.apellido}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`📱 Teléfono: ${admin.telefono}`);
    console.log('-----------------------------------------');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ El usuario administrador ya existe.');
    } else {
      console.error('❌ Error al crear el administrador:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
