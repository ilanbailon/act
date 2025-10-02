# Actívate

Aplicación web ligera para organizar tareas, ideas y sesiones Pomodoro directamente en el navegador. Funciona 100 % con HTML, CSS y JavaScript vanilla, por lo que puedes desplegarla en Netlify u otro hosting estático sin procesos de build.

## Características principales

- **Planificador semanal:** columnas para "Hoy", "Esta semana" y "Más adelante" con prioridad, notas y seguimiento de pomodoros por tarea.
- **Temporizador Pomodoro integrado:** configura duraciones de enfoque y descansos, registra tus sesiones y vincula tareas activas.
- **Banco de ideas:** guarda notas rápidas, fíjalas en la parte superior y mantenlas separadas de la lista de pendientes.
- **Resumen y exportación:** consulta métricas clave y descarga una copia de seguridad en JSON. Toda la información vive en `localStorage`.

## Estructura del proyecto

```
.
├── index.html   # Layout principal y accesibilidad
├── style.css    # Estilos con enfoque oscuro y componentes reutilizables
└── main.js      # Lógica del planificador, ideas y temporizador
```

## Uso local

1. Clona el repositorio o descarga los archivos.
2. Abre `index.html` en tu navegador preferido. No necesitas servidor ni dependencias extra.
3. Personaliza textos, colores o lógica editando directamente los archivos.

## Despliegue en Netlify (plan gratuito)

1. Crea un nuevo sitio desde Git o arrastra la carpeta al panel de Netlify.
2. Deja en blanco el comando de build y usa la carpeta raíz (`/`) como directorio de publicación.
3. Publica y listo. Cada navegador mantiene sus propios datos gracias a `localStorage`.

## Mantenimiento de datos

- Usa el botón **Exportar datos** del pie de página para descargar un respaldo en JSON.
- El botón **Borrar todo** restablece tareas, ideas, configuraciones y registro.
- Si quieres migrar tu información a otro navegador, importa el JSON desde `localStorage` manualmente o adapta el script según tus necesidades.
