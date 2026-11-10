# Sistema de Control y Operación Radial · Radio Sol Andino
G1 NOOBMASTER · Interacción Humano Computador · UNAMBA
Paniagua Ferrel Jhosep Emilio · Barauna Lucana Jeancarlos David

Aplicación web de operación de **Radio Sol Andino** (5 módulos) construida con
**Astro 5 + Tailwind CSS 4 + Flowbite 4** (componentes y tokens de Flowbite,
con los valores de color y tipografía del lenguaje visual V8).

## Cómo ejecutarlo
Requisitos: Node.js 18.20 o superior.
```bash
npm install
npm run dev        # abre http://localhost:4321
npm run build      # genera la versión final en /dist
```

## Módulos
| Ruta | Módulo | Qué se puede hacer |
|---|---|---|
| `/` | Cabina | Hablar al aire, cartuchos de pauta, cola del AutoDJ, silenciar la emisora |
| `/musica` | Música | Biblioteca con filtros, búsqueda con historial, añadir a lista, activar listas, reordenar, subir canciones, editar género (avanzado), eliminar duplicados |
| `/parrilla` | Parrilla | Programación por día, nuevo programa con valores sugeridos, autocompletado de conductor, control de cruces de horario, asignar conductor |
| `/sonido` | Sonido | Ecualizador de 5 bandas, ajustes rápidos, pre-escucha, aplicar al aire con deshacer, compresor y limitador (avanzado). No disponible en nivel básico |
| `/oyentes` | Oyentes | Oyentes en vivo, gráfico hoy vs. ayer, ciudades y plataformas, mensajes «leer al aire», reporte CSV para anunciantes (avanzado) |

## Detalle del módulo Cabina
| Función | Componente Flowbite | Actividad |
|---|---|---|
| Hablar al aire con bucle de 4 fases (presionado → spinner «Abriendo micrófono…» → «Micrófono abierto») | Button + *Button with loader* (spinner) | AP10 |
| Cartuchos de pauta (F1–F6): cargando → sonando con cuenta regresiva; bloquea el doble toque | Button, Badge, Progress | AP10 |
| Insertar en la cola: 3 categorías + búsqueda predictiva + sugerencia de la parrilla + recientes | Modal, Tabs (pills), Search input | AP8 |
| Silenciar emisora: escribir «SILENCIAR» + casilla + conteo de 3 s | Modal (backdrop estático), Input, Checkbox | AP9 |
| Deshacer inserciones durante 10 s | Toast | AP9 |
| Nivel de interfaz Básico / Intermedio / Avanzado (revelación progresiva) | Dropdown | Proyecto |
| Estados: carga (skeleton), vacío (cola vacía), error (corte de conexión), silencio | Skeleton, Alert | Primer avance (5 estados) |
| Registro de eventos en vivo | Timeline | — |
| Atajos: barra espaciadora = micrófono, F1–F6 = cartuchos | — | AP10 |

Botones de prueba en el pie de página: **Simular corte de conexión** y **Vaciar cola**.

## Estructura
```
src/
  pages/index.astro        Cabina
  pages/musica.astro       Música
  pages/parrilla.astro     Parrilla
  pages/sonido.astro       Sonido
  pages/oyentes.astro      Oyentes (gráfico con ApexCharts, la librería de Flowbite Charts)
  layouts/App.astro        Plantilla común: barra superior, pie y toasts
  components/Modal.astro   Envoltura del Modal de Flowbite
  components/Navbar.astro  Barra superior, pestañas y selector de nivel
  components/Spinner.astro Spinner de Flowbite (button with loader)
  scripts/comun.ts         Reloj, nivel de interfaz, toasts y botón con loader
  scripts/*.ts             Lógica de cada módulo
  lib/azuracast.ts         Acceso a AzuraCast (modo DEMO con latencia simulada)
  data/mock.ts             Datos de ejemplo de la emisora
  styles/global.css        Tailwind + tema de Flowbite + tokens V8
```

## Conexión con AzuraCast
`src/lib/azuracast.ts` funciona en modo DEMO. Cada función indica el endpoint real
de la API de AzuraCast (`/api/nowplaying/{station}`, `/backend/skip`, etc.).
Las acciones que modifican la emisión deben pasar por un backend propio porque la
clave API de AzuraCast nunca va al navegador (RNF-08).
