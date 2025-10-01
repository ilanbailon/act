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
