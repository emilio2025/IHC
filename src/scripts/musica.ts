import { Modal } from 'flowbite';
import { BIBLIOTECA, GENEROS, type Cancion } from '../data/mock';
import * as api from '../lib/azuracast';
import { $, $$, mmss, toast, cargando, sacudir } from './comun';

let datos: Cancion[] = BIBLIOTECA.map((c) => ({ ...c }));
let filtro = 'Todo';
const spinHTML = $<HTMLTemplateElement>('#tpl-spin').innerHTML;
const genColor: Record<string, string> = { Huayno: 'bg-success-soft text-fg-success border-brand/40', 'Vals criollo': 'bg-aqua/10 text-aqua border-aqua/40', Cumbia: 'bg-purple/10 text-fg-purple border-purple/40', Cuña: 'bg-warning-soft text-fg-warning border-amber/40', Jingle: 'bg-warning-soft text-fg-warning border-amber/40' };

/* ---------- Tabla ---------- */
function pintar() {
  const q = $<HTMLInputElement>('#buscar').value.trim().toLowerCase();
  const filas = datos.filter((c) => (filtro === 'Todo' || c.genero === filtro) && (!q || `${c.titulo} ${c.artista}`.toLowerCase().includes(q)));
  $('#filas').innerHTML = filas.map((c) => `
    <tr class="border-b border-default last:border-0 ${c.estado === 'Sonando' ? 'bg-brand-soft/50' : 'hover:bg-neutral-tertiary'}" data-id="${c.id}">
      <td class="px-4 py-3"><div class="flex items-center gap-3">
        <span class="grid place-items-center w-9 h-9 rounded-base bg-neutral-tertiary-medium font-heading font-bold text-heading">${c.titulo[0]}</span>
        <div><p class="font-semibold text-heading">${c.titulo}</p><p class="text-xs">${c.artista}</p></div></div></td>
      <td class="px-4 py-3"><span class="text-xs font-medium px-2 py-0.5 rounded-full border ${genColor[c.genero] ?? 'bg-neutral-tertiary text-body border-default'}">${c.genero}</span></td>
      <td class="px-4 py-3 font-mono text-heading">${mmss(c.duracion)}</td>
      <td class="px-4 py-3 font-mono" data-niveles="avanzado">${c.reproducciones}</td>
      <td class="px-4 py-3 text-end whitespace-nowrap">
        ${c.estado === 'Sonando' ? '<span class="text-xs font-bold text-fg-danger">● Sonando</span>'
        : c.estado === 'Duplicado' ? `<span class="text-xs font-medium px-2 py-0.5 rounded-full border bg-danger-soft text-fg-danger border-danger-subtle me-2">Duplicado</span><button class="eliminar text-sm font-semibold text-fg-danger hover:underline">Eliminar</button>`
        : `<button class="anadir inline-flex items-center text-sm font-semibold text-brand hover:underline"><span class="spin hidden">${spinHTML}</span><span class="txt">＋ Añadir a lista</span></button>`}
        <button class="editar ms-3 text-sm text-body hover:text-heading underline" data-niveles="avanzado">Editar</button>
      </td></tr>`).join('');
  $('#vacio').classList.toggle('hidden', filas.length > 0);
  $('#total').textContent = String(datos.length);
  const n = localStorage.getItem('nivel') || 'intermedio';
  for (const el of $$('#filas [data-niveles]')) el.style.display = el.dataset.niveles!.includes(n) ? '' : 'none';
}
document.addEventListener('nivel', pintar);

for (const b of $$('.filtro')) b.addEventListener('click', () => {
  filtro = b.dataset.f!;
  for (const x of $$('.filtro')) { const on = x === b; x.classList.toggle('bg-brand', on); x.classList.toggle('text-gray-950', on); x.classList.toggle('font-bold', on); x.classList.toggle('text-body', !on); }
  pintar();
});
$('#limpiar').addEventListener('click', () => { $<HTMLInputElement>('#buscar').value = ''; ($$('.filtro')[0]).click(); });

/* ---------- Búsqueda con historial ---------- */
const buscar = $<HTMLInputElement>('#buscar');
const leerRecientes = (): string[] => { try { return JSON.parse(localStorage.getItem('recientes') || 'null') || ['flor de retama', 'huaynos de oro', 'valicha']; } catch { return ['flor de retama', 'huaynos de oro', 'valicha']; } };
function pintarRecientes() {
  $('#recientes').innerHTML = leerRecientes().map((r) => `<button class="hist w-full text-start px-2 py-1.5 rounded-base hover:bg-neutral-tertiary-medium text-sm text-heading" data-q="${r}">↺ ${r}</button>`).join('');
}
function guardarReciente(q: string) {
  if (q.length < 3) return;
  const r = [q, ...leerRecientes().filter((x) => x !== q)].slice(0, 3);
  try { localStorage.setItem('recientes', JSON.stringify(r)); } catch { /* */ }
}
buscar.addEventListener('focus', () => { if (!buscar.value) { pintarRecientes(); $('#historial').classList.remove('hidden'); } });
buscar.addEventListener('input', () => { $('#historial').classList.toggle('hidden', buscar.value !== ''); pintar(); });
buscar.addEventListener('change', () => guardarReciente(buscar.value.trim().toLowerCase()));
document.addEventListener('click', (e) => { if (!(e.target as HTMLElement).closest('#historial, #buscar')) $('#historial').classList.add('hidden'); });
$('#historial').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('.hist') as HTMLElement | null; if (!b) return;
  buscar.value = b.dataset.q!; guardarReciente(b.dataset.q!.toLowerCase()); $('#historial').classList.add('hidden'); pintar();
});

/* ---------- Acciones de fila ---------- */
let actual: Cancion | null = null;
$('#filas').addEventListener('click', async (e) => {
  const t = e.target as HTMLElement; const tr = t.closest('tr') as HTMLElement | null; if (!tr) return;
  const c = datos.find((x) => x.id === tr.dataset.id)!;
  const anadir = t.closest('.anadir') as HTMLElement | null;
  if (anadir) {
    cargando(anadir, true, 'Añadiendo…'); await api.anadirALista(c.id, 'Mañanas andinas');
    cargando(anadir, false, '✓ En la lista'); anadir.classList.replace('text-brand', 'text-fg-success');
    toast('Añadida a «Mañanas andinas»', `«${c.titulo}» quedó al final de la lista.`);
  } else if (t.closest('.editar')) abrirEditar(c);
  else if (t.closest('.eliminar')) abrirEliminar(c);
});

/* ---------- Listas: activar / desactivar ---------- */
for (const tg of $$<HTMLInputElement>('.lista-toggle')) tg.addEventListener('change', async () => {
  tg.disabled = true; await api.alternarLista(tg.dataset.id!); tg.disabled = false;
  toast(tg.checked ? 'Lista activada' : 'Lista desactivada', `«${tg.dataset.nombre}» ${tg.checked ? 'sonará en su horario' : 'ya no sonará en su horario'}.`, tg.checked ? 'ok' : 'aviso');
});

/* ---------- Orden de la lista ---------- */
$('#orden').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button'); if (!b) return;
  const li = b.closest('li')!; const ol = $('#orden');
  if (b.classList.contains('subir') && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling);
  if (b.classList.contains('bajar') && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li);
  $$('#orden .num').forEach((n, i) => (n.textContent = String(i + 1).padStart(2, '0')));
  li.classList.add('border-brand'); setTimeout(() => li.classList.remove('border-brand'), 600);
});

/* ---------- Subir canciones ---------- */
const mSubir = new Modal($('#modal-subir'), { backdrop: 'dynamic' });
$('#btn-subir').addEventListener('click', () => { $('#subidas').innerHTML = ''; mSubir.show(); });
function subir(nombres: string[]) {
  for (const n of nombres) {
    const li = document.createElement('li');
    li.innerHTML = `<div class="flex justify-between text-sm mb-1"><span class="text-heading font-medium truncate">${n}</span><span class="pct font-mono text-xs">0 %</span></div><div class="w-full bg-neutral-tertiary-medium rounded-full h-1.5"><div class="bar bg-brand h-1.5 rounded-full" style="width:0%"></div></div>`;
    $('#subidas').appendChild(li);
    let p = 0; const t = setInterval(async () => {
      p = Math.min(100, p + 8 + Math.random() * 18);
      (li.querySelector('.bar') as HTMLElement).style.width = `${p}%`; li.querySelector('.pct')!.textContent = `${Math.round(p)} %`;
      if (p >= 100) {
        clearInterval(t); li.querySelector('.pct')!.textContent = 'Procesando…'; await api.subirArchivo(n);
        li.querySelector('.pct')!.innerHTML = '<span class="text-fg-success font-bold">✓ Lista</span>';
        const titulo = n.replace(/\.(mp3|flac|ogg)$/i, '');
        datos.unshift({ id: `n${Date.now()}${Math.random()}`, titulo, artista: 'Sin artista (editar)', genero: 'Huayno', duracion: 180 + Math.floor(Math.random() * 60), tipo: 'Canción', reproducciones: 0 });
        pintar();
      }
    }, 220);
  }
  setTimeout(() => toast(`${nombres.length} archivo(s) subidos`, 'Revisa el artista y el género de las canciones nuevas.'), 3200);
}
$<HTMLInputElement>('#archivos').addEventListener('change', (e) => subir(Array.from((e.target as HTMLInputElement).files ?? []).map((f) => f.name)));
$('#btn-ejemplo').addEventListener('click', () => subir(['Toro mozo.mp3', 'Carnaval de Tambobamba.mp3', 'Yaraví de la despedida.mp3']));

/* ---------- Editar metadatos: género predictivo + 3 categorías (Actividad 8) ---------- */
const mEditar = new Modal($('#modal-editar'), { backdrop: 'dynamic' });
const gIn = $<HTMLInputElement>('#ed-genero');
let catActiva = 'Andina';
function pintarCats() {
  $('#ed-cats').innerHTML = Object.keys(GENEROS).map((c) => `<li class="flex-1"><button type="button" data-c="${c}" class="w-full px-2 py-1.5 rounded-base ${c === catActiva ? 'bg-brand text-gray-950 font-bold' : 'text-body hover:text-heading'}">${c} <span class="font-mono text-[10px] opacity-70">${GENEROS[c].length}</span></button></li>`).join('');
  $('#ed-opciones').innerHTML = GENEROS[catActiva].map((g) => `<button type="button" data-g="${g}" class="ed-op text-sm px-3 py-1.5 rounded-full border ${gIn.value === g ? 'bg-brand text-gray-950 border-brand font-bold' : 'border-default bg-neutral-tertiary text-heading hover:bg-neutral-tertiary-medium'}">${g}</button>`).join('');
}
function elegirGenero(g: string) {
  gIn.value = g; $('#ed-sug').classList.add('hidden');
  catActiva = Object.keys(GENEROS).find((c) => GENEROS[c].includes(g)) ?? catActiva; pintarCats();
}
gIn.addEventListener('input', () => {
  const q = gIn.value.trim().toLowerCase();
  const todas = Object.entries(GENEROS).flatMap(([c, gs]) => gs.map((g) => [g, c]));
  const s = q.length >= 2 ? todas.filter(([g]) => g.toLowerCase().includes(q)).slice(0, 3) : [];
  $('#ed-sug').innerHTML = s.map(([g, c]) => `<li><button type="button" data-g="${g}" class="w-full text-start px-3 py-2 rounded-base hover:bg-neutral-tertiary-medium"><b class="text-heading">${g}</b> <span class="text-xs">${c}</span></button></li>`).join('');
  $('#ed-sug').classList.toggle('hidden', s.length === 0);
});
$('#modal-editar').addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const c = t.closest('[data-c]') as HTMLElement | null; if (c) { catActiva = c.dataset.c!; pintarCats(); return; }
  const g = t.closest('[data-g]') as HTMLElement | null; if (g) elegirGenero(g.dataset.g!);
});
function abrirEditar(c: Cancion) { actual = c; $('#ed-titulo').textContent = `«${c.titulo}» · ${c.artista}`; gIn.value = c.genero; catActiva = Object.keys(GENEROS).find((k) => GENEROS[k].includes(c.genero)) ?? 'Andina'; pintarCats(); mEditar.show(); }
$('#ed-guardar').addEventListener('click', async (e) => {
  const b = e.currentTarget as HTMLElement;
  const valido = Object.values(GENEROS).flat().includes(gIn.value);
  if (!valido) { sacudir(gIn); toast('Elige un género de la lista', 'Escribe 2–3 letras y toca una sugerencia.', 'aviso'); return; }
  cargando(b, true, 'Guardando…'); await api.guardarMetadatos(actual!.id); cargando(b, false, 'Guardar metadatos');
  actual!.genero = gIn.value; mEditar.hide(); pintar(); toast('Metadatos guardados', `«${actual!.titulo}» ahora es ${gIn.value}.`);
});

/* ---------- Eliminar duplicado (Actividad 9) ---------- */
const mEliminar = new Modal($('#modal-eliminar'), { backdrop: 'static' });
const elIn = $<HTMLInputElement>('#el-input'), elCk = $<HTMLInputElement>('#el-check'), elBtn = $('#el-confirmar');
const listo = () => !!actual && elIn.value === actual.titulo && elCk.checked;
function validar() { const ok = listo(); elBtn.classList.toggle('opacity-40', !ok); elBtn.classList.toggle('cursor-not-allowed', !ok); elBtn.classList.toggle('glow-onair', ok); if (ok) $('#el-error').classList.add('hidden'); }
elIn.addEventListener('input', validar); elCk.addEventListener('change', validar);
function abrirEliminar(c: Cancion) { actual = c; for (const s of $$('.el-nombre')) s.textContent = c.titulo; elIn.value = ''; elCk.checked = false; $('#el-error').classList.add('hidden'); validar(); mEliminar.show(); }
elBtn.addEventListener('click', async () => {
  if (!listo()) { $('#el-error').classList.remove('hidden'); sacudir(elBtn); return; }
  cargando(elBtn, true, 'Eliminando…'); await api.eliminarArchivo(actual!.id); cargando(elBtn, false, 'Eliminar canción');
  const borrada = actual!, idx = datos.indexOf(borrada); datos.splice(idx, 1); mEliminar.hide(); pintar();
  toast('Canción eliminada', 'Se quitó de 2 listas de reproducción.', 'ok', () => { datos.splice(idx, 0, borrada); pintar(); toast('Eliminación deshecha', `«${borrada.titulo}» volvió a la biblioteca.`); });
});

for (const [id, m] of [['modal-subir', mSubir], ['modal-editar', mEditar], ['modal-eliminar', mEliminar]] as const)
  for (const b of $$(`[data-cerrar="${id}"]`)) b.addEventListener('click', () => m.hide());
pintar();
document.addEventListener('click', (e) => { if (!(e.target as HTMLElement).closest('#ed-genero, #ed-sug')) $('#ed-sug').classList.add('hidden'); });
