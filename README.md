
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


# Task Planner PWA (HTML + CSS + JS)

Aplicación de tareas mínima construida con HTML, CSS y JavaScript vanilla que usa Supabase para autenticación y almacenamiento. Incluye vistas de Hoy, Semana (con drag & drop) y Todas las tareas, más un modal para crear/editar.

## Uso rápido

1. Abre `index.html` en un servidor estático (por ejemplo `npx serve` o la previsualización de Netlify). La aplicación es un módulo ES que carga `@supabase/supabase-js` desde CDN.
2. Inicia sesión con email/contraseña, regístrate o solicita un enlace mágico.
3. Gestiona tus tareas en las tres vistas disponibles. El service worker mantiene una copia en caché para lectura offline.

## Supabase

Los valores de `SUPABASE_URL` y `SUPABASE_ANON_KEY` están incrustados en `js/supabaseClient.js`. Si cambias de proyecto solo actualiza esas constantes.

La tabla `public.tasks` debe existir con las columnas descritas y RLS que limite a `user_id = auth.uid()`. El frontend siempre inserta `user_id` a partir de la sesión activa.

## Funcionalidades principales

- **Hoy:** muestra tareas programadas para la fecha actual o tipo `quick` sin fecha, ordenadas por prioridad y urgencia.
- **Semana:** cuadrícula lunes-domingo con arrastrar y soltar para mover tareas entre días o a “Sin programar”.
- **Todas:** buscador y filtros por estado, prioridad y proyecto. Botón para crear nueva tarea.
- **Urgencia:** `bandColor` y `computeCountdown` calculan banda y cuenta regresiva para `due_at`.
- **PWA:** `manifest.webmanifest` y `sw.js` cachean assets y permiten lectura básica sin conexión.
- **Toasts:** feedback simple para éxito o errores de Supabase.

No hay dependencias ni paso de build; basta con desplegar el contenido del repositorio en cualquier hosting estático.

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


