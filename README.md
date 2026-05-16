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
1. Entra a la carpeta `server`: `cd server`
2. Instala dependencias: `npm install`
3. Configura tu `.env` con los datos de tu MySQL local.
4. Genera el cliente de Prisma: `npx prisma generate`
5. Levanta el servidor: `npm run dev` (Asegúrate de agregar el script dev en package.json)

### 2. Configurar Frontend
1. Entra a la carpeta `client`: `cd client`
2. Instala dependencias: `npm install`
3. Levanta el proyecto: `npm run dev`

## Próximos pasos
- Implementar la lógica de creación de turnos para clientes.
- Panel de administración para crear barberías.
- Conexión real con la base de datos MySQL.
