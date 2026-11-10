/**
 * Capa de acceso a AzuraCast.
 * Este módulo funciona en modo DEMO (respuestas simuladas con latencia real)
 * para poder presentarlo sin servidor. Para conectarlo a una estación real:
 *   1. Definir PUBLIC_AZURACAST_URL y PUBLIC_STATION en .env
 *   2. Las acciones que modifican la emisión deben pasar por un backend propio:
 *      la clave API de AzuraCast nunca va al navegador (RNF-08).
 * Endpoints de referencia (AzuraCast REST API):
 *   GET  /api/nowplaying/{station}                 → pista actual, oyentes, cola
 *   POST /api/station/{station}/backend/skip       → siguiente canción
 *   POST /api/station/{station}/requests/{id}      → insertar en la cola
 *   POST /api/station/{station}/backend/stop|start → silenciar / reanudar
 */
export const DEMO = true;

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Latencia simulada de red + servidor (150–300 ms). */
const latencia = () => espera(150 + Math.random() * 150);

export interface Resultado { ok: boolean; mensaje?: string }

export async function abrirMicrofono(): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function cerrarMicrofono(): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function lanzarCartucho(_id: string): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function insertarEnCola(_nombre: string): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function siguienteCancion(): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function silenciarEmisora(): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function reanudarAutoDJ(): Promise<Resultado> { await latencia(); return { ok: true }; }
/** Primera carga del panel (para mostrar el estado de carga con skeleton). */
export async function cargarEstado(): Promise<Resultado> { await espera(900); return { ok: true }; }

/* Música:   POST /api/station/{station}/files  ·  PUT /files/{id}  ·  DELETE /files/{id}  ·  PUT /playlist/{id}/toggle */
export async function subirArchivo(_nombre: string): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function guardarMetadatos(_id: string): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function eliminarArchivo(_id: string): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function alternarLista(_id: string): Promise<Resultado> { await latencia(); return { ok: true }; }
export async function anadirALista(_id: string, _lista: string): Promise<Resultado> { await latencia(); return { ok: true }; }
/* Parrilla: POST /api/station/{station}/playlists (programación por horario) · /streamers/{id}/schedule */
export async function guardarPrograma(): Promise<Resultado> { await latencia(); return { ok: true }; }
/* Sonido: configuración de Liquidsoap (backend propio + /api/station/{station}/backend/restart) */
export async function aplicarSonido(): Promise<Resultado> { await espera(400 + Math.random() * 200); return { ok: true }; }
/* Oyentes: GET /api/station/{station}/listeners · /reports/overview */
export async function generarReporte(): Promise<Resultado> { await espera(900); return { ok: true }; }
export async function marcarLeido(_id: string): Promise<Resultado> { await latencia(); return { ok: true }; }
