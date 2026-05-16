# Gestión Barbería Multi-Tenant

Sistema de gestión para múltiples barberías con perfiles de Super Admin, Dueño de Empresa y Clientes.

## Tecnologías
- **Frontend**: React + Vite + Lucide Icons
- **Backend**: Node.js + Express + Prisma ORM
- **Base de Datos**: MySQL (Local) / Supabase (Futuro)

## Estructura
- `/server`: Backend API
- `/client`: Frontend React

## Cómo empezar

### 1. Configurar Backend
1. Entrar a la carpeta `server`: `cd server`
2. Instalar dependencias: `npm install`
3. Configurar  `.env` con los datos  MySQL local.
4. Generar el cliente de Prisma: `npx prisma generate`
5. Levantar el servidor: `npm run dev` 

### 2. Configurar Frontend
1. Entrar a la carpeta `client`: `cd client`
2. Instalar dependencias: `npm install`
3. Levantar el proyecto: `npm run dev`

## Próximos pasos
- Implementar la lógica de creación de turnos para clientes.
- Panel de administración para crear barberías.
- Conexión real con la base de datos MySQL.
