# ACT Planner

PWA mínima creada con React + Vite + TypeScript + Tailwind que consume Supabase usando `supabase-js` v2. Implementa autenticación por correo (contraseña o magic link) y gestiona una tabla `public.tasks` con RLS donde cada usuario sólo accede a sus registros.

## Requisitos

1. Configura las variables de entorno en un archivo `.env` o en Netlify/Vercel:

```bash
VITE_SUPABASE_URL="https://wbzxbfqowlfmmkwqeyam.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndienhiZnFvd2xmbW1rd3FleWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5ODUwMDQsImV4cCI6MjA3MjU2MTAwNH0.mJJ7yID73tUerWE_aiNw3ZE4o-Q9YrT39YN-iS2CksA"
```

2. Instala dependencias y levanta el entorno local:

```bash
npm install
npm run dev
```

3. Para generar la build de producción y previsualizarla:

```bash
npm run build
npm run preview
```

## Funcionalidades

- **Auth**: Inicio de sesión con correo/contraseña, registro y magic link. La sesión se persiste y se redirige automáticamente al dashboard.
- **Today**: Muestra tareas programadas para hoy o rápidas sin fecha. Permite marcar como done, ciclar estado y editar con modal.
- **Week**: Calendario semanal (lunes a domingo) con drag & drop para reprogramar tareas; las tareas sin fecha aparecen en un backlog.
- **All Tasks**: Buscador y filtros por estado, proyecto y prioridad. Modal para crear/editar, opción para borrar tareas.
- **PWA**: Manifest, service worker estático y modo oscuro con Tailwind.

## Estructura principal

```
src/
├── App.tsx
├── components/
├── hooks/
├── lib/
├── pages/
├── providers/
├── utils/
└── main.tsx
```

Los comentarios clave dentro del código indican qué campos ajustar si cambian los nombres en Supabase.
