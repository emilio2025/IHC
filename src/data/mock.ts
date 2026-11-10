// Datos de ejemplo de Radio Sol Andino (98.7 FM · Abancay).
// En producción vienen de la API de AzuraCast (ver src/lib/azuracast.ts).

export type Nivel = 'basico' | 'intermedio' | 'avanzado';

export interface Pista { titulo: string; artista: string; genero: string; duracion: number; lista?: string }
export interface ItemCola { hora: string; titulo: string; tipo: 'Canción' | 'Cuña' | 'Jingle' | 'Pauta' }
export interface Cartucho { id: string; nombre: string; tipo: 'CUÑA' | 'JINGLE' | 'AVISO' | 'AUTO'; duracion: number; tecla: string }
export interface Insertable { nombre: string; categoria: 'Canción' | 'Cuña y pauta' | 'Jingle e ID'; meta: string }

export const ESTACION = { nombre: 'Radio Sol Andino', frecuencia: '98.7 FM', ciudad: 'Apurímac', oyentes: 128 };

export const SONANDO: Pista = { titulo: 'Valicha', artista: 'Los Hermanos Ayala', genero: 'Huayno', duracion: 232, lista: 'Mañanas andinas' };
export const SIGUIENTE: Pista = { titulo: 'Adiós pueblo de Ayacucho', artista: 'Trío Ayacucho', genero: 'Huayno', duracion: 192 };

export const COLA: ItemCola[] = [
  { hora: '10:44:22', titulo: 'Adiós pueblo de Ayacucho', tipo: 'Canción' },
  { hora: '10:47:34', titulo: 'Tanda 10:45 (3 cuñas)', tipo: 'Pauta' },
  { hora: '10:49:04', titulo: 'ID «La voz de Apurímac»', tipo: 'Jingle' },
  { hora: '10:49:14', titulo: 'Flor de retama', tipo: 'Canción' },
];

export const PAUTA: Cartucho[] = [
  { id: 'c1', nombre: 'Ferretería El Sol', tipo: 'CUÑA', duracion: 30, tecla: 'F1' },
  { id: 'c2', nombre: 'Pollería Don Lucho', tipo: 'CUÑA', duracion: 20, tecla: 'F2' },
  { id: 'c3', nombre: 'ID «La voz de Apurímac»', tipo: 'JINGLE', duracion: 10, tecla: 'F3' },
  { id: 'c4', nombre: 'Municipalidad de Abancay', tipo: 'AVISO', duracion: 45, tecla: 'F4' },
  { id: 'c5', nombre: 'Farmacia Salud+', tipo: 'CUÑA', duracion: 30, tecla: 'F5' },
  { id: 'c6', nombre: 'Hora exacta', tipo: 'AUTO', duracion: 8, tecla: 'F6' },
];

// Actividad 8: 16 elementos que antes se mostraban en una lista plana,
// ahora agrupados en 3 categorías + búsqueda predictiva.
export const INSERTABLES: Insertable[] = [
  { nombre: 'Flor de retama', categoria: 'Canción', meta: 'Martina Portocarrero · 4:05' },
  { nombre: 'Vírgenes del Sol', categoria: 'Canción', meta: 'Jorge Bravo de Rueda · 3:48' },
  { nombre: 'Ojos azules', categoria: 'Canción', meta: 'Dúo Ayacucho · 3:41' },
  { nombre: 'La flor de la canela', categoria: 'Canción', meta: 'Chabuca Granda · 3:20' },
  { nombre: 'Cuña Pollería Don Lucho', categoria: 'Cuña y pauta', meta: '0:20 · emitida 3 veces hoy' },
  { nombre: 'Cuña Ferretería El Inca', categoria: 'Cuña y pauta', meta: '0:30 · emitida 2 veces hoy' },
  { nombre: 'Cuña Farmacia Salud', categoria: 'Cuña y pauta', meta: '0:30' },
  { nombre: 'Cuña Transportes Sol', categoria: 'Cuña y pauta', meta: '0:25' },
  { nombre: 'Tanda comercial 10:45', categoria: 'Cuña y pauta', meta: 'Programada · 3 cuñas' },
  { nombre: 'Pauta municipal', categoria: 'Cuña y pauta', meta: '0:45' },
  { nombre: 'Promo Mañanas andinas', categoria: 'Cuña y pauta', meta: '0:15' },
  { nombre: 'ID «La voz de Apurímac»', categoria: 'Jingle e ID', meta: '0:10' },
  { nombre: 'ID corto 5 s', categoria: 'Jingle e ID', meta: '0:05' },
  { nombre: 'Jingle hora exacta', categoria: 'Jingle e ID', meta: '0:08' },
  { nombre: 'Jingle del clima', categoria: 'Jingle e ID', meta: '0:09' },
  { nombre: 'Cortina del noticiero', categoria: 'Jingle e ID', meta: '0:12' },
];

export const PARRILLA = [
  { hora: '06:00', programa: 'Mañanas andinas · Ana López', estado: 'Al aire' },
  { hora: '11:00', programa: 'Noticiero regional · Lucía Ccahuana', estado: 'En 18 min' },
  { hora: '12:00', programa: 'Música criolla · AutoDJ', estado: 'Programado' },
];

/* ===================== MÚSICA ===================== */
export interface Cancion { id: string; titulo: string; artista: string; genero: string; duracion: number; tipo: 'Canción' | 'Cuña' | 'Jingle'; reproducciones: number; estado?: 'Sonando' | 'En cola' | 'Duplicado' }
export const BIBLIOTECA: Cancion[] = [
  { id: 'm1', titulo: 'Valicha', artista: 'Los Hermanos Ayala', genero: 'Huayno', duracion: 232, tipo: 'Canción', reproducciones: 21, estado: 'Sonando' },
  { id: 'm2', titulo: 'Adiós pueblo de Ayacucho', artista: 'Trío Ayacucho', genero: 'Huayno', duracion: 192, tipo: 'Canción', reproducciones: 14, estado: 'En cola' },
  { id: 'm3', titulo: 'Flor de retama', artista: 'Martina Portocarrero', genero: 'Huayno', duracion: 245, tipo: 'Canción', reproducciones: 9 },
  { id: 'm4', titulo: 'Vírgenes del Sol', artista: 'Jorge Bravo de Rueda', genero: 'Vals criollo', duracion: 228, tipo: 'Canción', reproducciones: 5 },
  { id: 'm5', titulo: 'Ojos azules', artista: 'Dúo Ayacucho', genero: 'Huayno', duracion: 221, tipo: 'Canción', reproducciones: 17 },
  { id: 'm6', titulo: 'La flor de la canela', artista: 'Chabuca Granda', genero: 'Vals criollo', duracion: 200, tipo: 'Canción', reproducciones: 11 },
  { id: 'm7', titulo: 'Cariñito', artista: 'Los Hijos del Sol', genero: 'Cumbia', duracion: 185, tipo: 'Canción', reproducciones: 8 },
  { id: 'm8', titulo: 'Cariñito (duplicado)', artista: 'Los Hijos del Sol', genero: 'Cumbia', duracion: 185, tipo: 'Canción', reproducciones: 0, estado: 'Duplicado' },
  { id: 'm9', titulo: 'Mal paso', artista: 'Los Shapis', genero: 'Chicha', duracion: 198, tipo: 'Canción', reproducciones: 6 },
  { id: 'm10', titulo: 'Negra del alma', artista: 'Los Kjarkas', genero: 'Saya', duracion: 254, tipo: 'Canción', reproducciones: 4 },
  { id: 'm11', titulo: 'Cuña Pollería Don Lucho', artista: 'Pauta comercial', genero: 'Cuña', duracion: 20, tipo: 'Cuña', reproducciones: 3 },
  { id: 'm12', titulo: 'ID «La voz de Apurímac»', artista: 'Identificación', genero: 'Jingle', duracion: 10, tipo: 'Jingle', reproducciones: 12 },
];
export const LISTAS = [
  { id: 'l1', nombre: 'Mañanas andinas', horario: '06:00 – 11:00', canciones: 64, activa: true, color: 'bg-brand' },
  { id: 'l2', nombre: 'Música criolla', horario: '12:00 – 13:00', canciones: 40, activa: true, color: 'bg-aqua' },
  { id: 'l3', nombre: 'Huaynos de oro', horario: '16:00 – 18:00', canciones: 88, activa: true, color: 'bg-amber' },
  { id: 'l4', nombre: 'Noche suave', horario: '22:00 – 06:00', canciones: 120, activa: false, color: 'bg-purple' },
];
/** Actividad 8: 18 géneros agrupados en 3 categorías para el buscador predictivo. */
export const GENEROS: Record<string, string[]> = {
  'Andina': ['Huayno', 'Huaylas', 'Carnaval', 'Yaraví', 'Saya', 'Folklore instrumental'],
  'Costeña y criolla': ['Vals criollo', 'Marinera', 'Festejo', 'Tondero'],
  'Tropical y popular': ['Cumbia', 'Chicha', 'Salsa', 'Merengue', 'Balada', 'Pop latino', 'Rock', 'Reggaetón'],
};

/* ===================== PARRILLA ===================== */
export const DIAS = ['Lun 19', 'Mar 20', 'Mié 21', 'Jue 22', 'Vie 23', 'Sáb 24', 'Dom 25'];
export interface Programa { inicio: string; fin: string; nombre: string; conductor: string; tipo: 'En vivo' | 'AutoDJ' | 'Grabado' }
export const PROGRAMAS: Programa[] = [
  { inicio: '06:00', fin: '11:00', nombre: 'Mañanas andinas', conductor: 'Ana López', tipo: 'En vivo' },
  { inicio: '11:00', fin: '12:00', nombre: 'Noticiero regional', conductor: 'Lucía Ccahuana', tipo: 'En vivo' },
  { inicio: '12:00', fin: '13:00', nombre: 'Música criolla', conductor: 'AutoDJ', tipo: 'AutoDJ' },
  { inicio: '14:00', fin: '16:00', nombre: 'Tarde deportiva', conductor: '', tipo: 'En vivo' },
  { inicio: '16:00', fin: '18:00', nombre: 'Huaynos de oro', conductor: 'AutoDJ', tipo: 'AutoDJ' },
  { inicio: '18:00', fin: '19:00', nombre: 'La voz de Apurímac', conductor: 'Jhon Palomino', tipo: 'En vivo' },
];
export const LOCUTORES = ['Jhon Palomino', 'Rosa Huamán', 'Rocío Quispe', 'Ana López', 'Lucía Ccahuana', 'Emilio Paniagua', 'Jeancarlos Barauna', 'Julio Huamán', 'Carlos Quispe', 'Marisol Ayala', 'Pedro Condori', 'Nilda Ccoyllo'];

/* ===================== SONIDO ===================== */
export const BANDAS = ['60 Hz', '250 Hz', '1 kHz', '4 kHz', '12 kHz'];
export const PRESETS: Record<string, number[]> = {
  'Plano': [0, 0, 0, 0, 0],
  'Voz clara': [-2, -1, 2, 4, 1],
  'Música andina': [2, 1, 0, 2, 3],
  'Noticiero': [-3, 0, 3, 3, 0],
  'Noche suave': [3, 1, -1, -2, -3],
};

/* ===================== OYENTES ===================== */
export const OYENTES_HORA = { horas: ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'], hoy: [42, 98, 164, 151, 128, 140, 117, 96, 88, 102, 121, 133, 149], ayer: [38, 87, 140, 133, 119, 126, 110, 90, 80, 95, 111, 120, 138] };
export const CIUDADES = [['Abancay', 54], ['Andahuaylas', 18], ['Cusco', 11], ['Lima', 9], ['Exterior', 8]] as const;
export const PLATAFORMAS = [['Web', 46], ['App móvil', 38], ['Radio FM (estimado)', 16]] as const;
export const MENSAJES = [
  { id: 'msg1', de: 'Rosa', via: 'WhatsApp', lugar: 'Tamburco', texto: '¡Saludos a toda mi familia en Curahuasi! Pido «Valicha».', hora: '10:38' },
  { id: 'msg2', de: 'Juan P.', via: 'Facebook', lugar: 'Abancay', texto: '¿Pueden pasar el aviso de la feria de Abancay?', hora: '10:35' },
  { id: 'msg3', de: 'Maribel', via: 'Web', lugar: 'Andahuaylas', texto: 'Feliz cumpleaños a mi mamá Victoria, que cumple 60.', hora: '10:31' },
  { id: 'msg4', de: 'Don Teo', via: 'WhatsApp', lugar: 'Lima', texto: 'Escuchando desde Lima, ¡arriba Apurímac!', hora: '10:22' },
];
