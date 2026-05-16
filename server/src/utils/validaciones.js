const { z } = require('zod');

// Esquema para el registro de usuarios
const esquemaRegistro = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  rol: z.enum(['SUPER_ADMIN', 'DUENO_EMPRESA']).optional(),
  empresaId: z.number().nullable().optional(),
});

// Esquema para el login
const esquemaLogin = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

// Esquema para la creación de empresas
const esquemaEmpresa = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  logo: z.string().url({ message: "El logo debe ser una URL válida" }).optional().or(z.literal("")),
});

module.exports = { esquemaRegistro, esquemaLogin, esquemaEmpresa };
