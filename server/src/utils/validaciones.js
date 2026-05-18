const { z } = require('zod');

// Esquema para el registro de usuarios
const esquemaRegistro = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  apellido: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  telefono: z.string().optional(),
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
  dias: z.string().optional(),
  horarios: z.string().optional().refine(val => {
    if (!val || val.trim() === "") return true;
    const matches = val.match(/\b\d{2}:\d{2}\b/g);
    if (!matches) return false;
    // Obligar a que haya al menos un rango completo (2 horas) y que las horas encontradas sean par (parejas de inicio/fin)
    return matches.length >= 2 && matches.length % 2 === 0;
  }, {
    message: "El formato de horarios debe contener parejas de inicio y fin válidas. Ej: '09:00 a 13:00' o '09:00 a 13:00, 16:00 a 20:00'"
  }),
});

module.exports = { esquemaRegistro, esquemaLogin, esquemaEmpresa };
