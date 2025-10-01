# Task Planner PWA

Aplicación React + Vite + TypeScript que gestiona tareas sincronizadas con Supabase.

## Configuración

1. Copia `.env.example` a `.env` y define:
   ```bash
   VITE_SUPABASE_URL="https://wbzxbfqowlfmmkwqeyam.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndienhiZnFvd2xmbW1rd3FleWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODUwMDQsImV4cCI6MjA3MjU2MTAwNH0.mJJ7yID73tUerWE_aiNw3ZE4o-Q9YrT39YN-iS2CksA"
   ```
2. Instala dependencias: `npm install`.
3. Ejecuta en desarrollo: `npm run dev`.
4. Compila para producción: `npm run build`.

## Características

- Autenticación con Supabase (email, registro y magic link).
- Vistas: Hoy, Semana con drag & drop y Todas las tareas con filtros.
- CRUD completo sobre `public.tasks` respetando RLS.
- PWA básica con `manifest.json` y `sw.js` para modo offline.
- React Query para manejo de datos y Tailwind CSS para estilos rápidos.
