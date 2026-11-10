import { Modal } from 'flowbite';
import { PROGRAMAS, LOCUTORES, DIAS, type Programa } from '../data/mock';
import * as api from '../lib/azuracast';
import { $, $$, pad, toast, cargando, sacudir } from './comun';

const semana: Programa[][] = DIAS.map((_, i) => (i < 5 ? PROGRAMAS.map((p) => ({ ...p })) : PROGRAMAS.filter((p) => p.tipo === 'AutoDJ').map((p) => ({ ...p }))));
let dia = 0;
const aMin = (h: string) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
const aHora = (m: number) => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const tipoColor: Record<string, string> = { 'En vivo': 'bg-danger-soft text-fg-danger border-danger-subtle', AutoDJ: 'bg-success-soft text-fg-success border-brand/40', Grabado: 'bg-aqua/10 text-aqua border-aqua/40' };
const nivel = () => { try { return localStorage.getItem('nivel') || 'intermedio'; } catch { return 'intermedio'; } };

function pintar() {
  const ps = semana[dia].sort((a, b) => aMin(a.inicio) - aMin(b.inicio));
  const ver = nivel() !== 'basico';
  $('#prog').innerHTML = ps.map((p, i) => `
    <tr class="border-b border-default last:border-0 ${!p.conductor ? 'bg-warning-soft/60' : 'hover:bg-neutral-tertiary'}">
      <td class="px-4 py-3 font-mono text-heading whitespace-nowrap">${p.inicio} – ${p.fin}</td>
      <td class="px-4 py-3 font-semibold text-heading">${p.nombre}</td>
      <td class="px-4 py-3">${p.conductor || '<span class="text-fg-warning font-semibold">Sin conductor</span>'}</td>
      <td class="px-4 py-3"><span class="text-xs font-medium px-2 py-0.5 rounded-full border ${tipoColor[p.tipo]}">${p.tipo}</span></td>
      <td class="px-4 py-3 text-end" style="display:${ver ? '' : 'none'}"><button class="quitar text-sm text-body hover:text-fg-danger underline" data-i="${i}">Quitar</button></td></tr>`).join('');
  const sin = ps.filter((p) => !p.conductor).length;
  $('#n-prog').textContent = String(ps.length); $('#n-sin').textContent = String(sin); $('#r-sin').textContent = String(sin);
  $('#aviso-sin').style.display = sin ? '' : 'none';
  const vivo = ps.filter((p) => p.tipo === 'En vivo').reduce((s, p) => s + aMin(p.fin) - aMin(p.inicio), 0) / 60;
  $('#r-vivo').textContent = `${vivo.toFixed(vivo % 1 ? 1 : 0)} h`; $('#r-auto').textContent = `${(24 - vivo).toFixed(vivo % 1 ? 1 : 0)} h`;
}
document.addEventListener('nivel', pintar);
for (const b of $$('.dia')) b.addEventListener('click', () => {
  dia = Number(b.dataset.d);
  for (const x of $$('.dia')) { const on = x === b; x.classList.toggle('bg-brand', on); x.classList.toggle('text-gray-950', on); x.classList.toggle('font-bold', on); x.classList.toggle('text-body', !on); }
  pintar();
});
$('#prog').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('.quitar') as HTMLElement | null; if (!b) return;
  const ps = semana[dia]; const i = Number(b.dataset.i); const [p] = ps.splice(i, 1); pintar();
  toast('Programa quitado', `«${p.nombre}» ya no está en la parrilla.`, 'aviso', () => { ps.push(p); pintar(); });
});
$('#btn-asignar').addEventListener('click', async (e) => {
  const b = e.currentTarget as HTMLElement; cargando(b, true, 'Asignando…'); await api.guardarPrograma(); cargando(b, false, 'Asignar conductor');
  const p = semana[dia].find((x) => !x.conductor); if (p) { p.conductor = 'Rosa Huamán'; pintar(); toast('Conductor asignado', `Rosa Huamán conducirá «${p.nombre}» (estaba libre a esa hora).`); }
});

/* ---------- Nuevo programa: valores por defecto inteligentes ---------- */
const m = new Modal($('#modal-nuevo'), { backdrop: 'static' });
const f = { nombre: $<HTMLInputElement>('#f-nombre'), fecha: $<HTMLInputElement>('#f-fecha'), inicio: $<HTMLInputElement>('#f-inicio'), dur: $<HTMLSelectElement>('#f-dur'), cond: $<HTMLInputElement>('#f-cond'), tipo: $<HTMLSelectElement>('#f-tipo') };
const recordar = (k: string, d: string) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
function franjaLibre(desde = 6 * 60, dur = 60) {
  const ps = semana[dia]; let t = desde;
  for (let i = 0; i < 40; i++) { const choque = ps.find((p) => t < aMin(p.fin) && t + dur > aMin(p.inicio)); if (!choque) return t; t = aMin(choque.fin); }
  return t;
}
function cruce() {
  const ini = aMin(f.inicio.value || '00:00'), fin = ini + Number(f.dur.value);
  return semana[dia].find((p) => ini < aMin(p.fin) && fin > aMin(p.inicio));
}
function revisarCruce() {
  const c = cruce(); $('#cruce').classList.toggle('hidden', !c);
  if (c) { $('#cruce-con').textContent = `${c.nombre}» (${c.inicio} – ${c.fin}`; $('#cruce-sug').textContent = `Sugerencia: empezar a las ${aHora(franjaLibre(aMin(f.inicio.value), Number(f.dur.value)))}.`; }
  f.inicio.classList.toggle('border-danger', !!c);
}
$('#btn-nuevo').addEventListener('click', () => {
  const hoy = new Date();
  f.nombre.value = ''; f.fecha.value = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  f.dur.value = recordar('ultDur', '60'); f.tipo.value = recordar('ultTipo', 'En vivo'); f.cond.value = recordar('ultCond', 'Jhon Palomino');
  f.inicio.value = aHora(franjaLibre(6 * 60, Number(f.dur.value)));
  $('#f-error').classList.add('hidden'); revisarCruce(); m.show(); setTimeout(() => f.nombre.focus(), 50);
});
f.inicio.addEventListener('input', revisarCruce); f.dur.addEventListener('change', revisarCruce);
$('#btn-mover').addEventListener('click', () => { f.inicio.value = aHora(franjaLibre(aMin(f.inicio.value), Number(f.dur.value))); revisarCruce(); });
/* Autocompletado del conductor */
f.cond.addEventListener('input', () => {
  const q = f.cond.value.trim().toLowerCase();
  const ini = aMin(f.inicio.value || '00:00'), fin = ini + Number(f.dur.value);
  const ocupado = (n: string) => semana[dia].some((p) => p.conductor === n && ini < aMin(p.fin) && fin > aMin(p.inicio));
  const s = q ? LOCUTORES.filter((l) => l.toLowerCase().split(' ').some((w) => w.startsWith(q)) || l.toLowerCase().startsWith(q)).slice(0, 4) : [];
  $('#f-sug').innerHTML = s.map((l) => `<li><button type="button" data-l="${l}" class="w-full text-start px-3 py-2 rounded-base hover:bg-neutral-tertiary-medium ${ocupado(l) ? 'opacity-50' : ''}"><b class="text-heading">${l}</b> <span class="text-xs">${ocupado(l) ? 'ocupado a esa hora' : 'libre'}</span></button></li>`).join('');
  $('#f-sug').classList.toggle('hidden', !s.length);
});
f.cond.addEventListener('focus', () => { if (!f.cond.value) f.cond.dispatchEvent(new Event('input')); });
$('#f-sug').addEventListener('click', (e) => { const b = (e.target as HTMLElement).closest('[data-l]') as HTMLElement | null; if (b) { f.cond.value = b.dataset.l!; $('#f-sug').classList.add('hidden'); } });
$('#btn-guardar').addEventListener('click', async (e) => {
  const b = e.currentTarget as HTMLElement;
  if (!f.nombre.value.trim()) { $('#f-error').classList.remove('hidden'); sacudir(f.nombre); return; }
  if (cruce()) { sacudir($('#cruce')); return; }
  cargando(b, true, 'Guardando…'); await api.guardarPrograma(); cargando(b, false, 'Guardar programa');
  const ini = aMin(f.inicio.value);
  semana[dia].push({ inicio: f.inicio.value, fin: aHora(ini + Number(f.dur.value)), nombre: f.nombre.value.trim(), conductor: f.cond.value.trim(), tipo: f.tipo.value as Programa['tipo'] });
  try { localStorage.setItem('ultDur', f.dur.value); localStorage.setItem('ultTipo', f.tipo.value); localStorage.setItem('ultCond', f.cond.value); } catch { /* */ }
  m.hide(); pintar(); toast('Programa guardado', `«${f.nombre.value.trim()}» de ${f.inicio.value} a ${aHora(ini + Number(f.dur.value))}.`);
});
for (const b of $$('[data-cerrar="modal-nuevo"]')) b.addEventListener('click', () => m.hide());
pintar();
document.addEventListener('click', (e) => { if (!(e.target as HTMLElement).closest('#f-cond, #f-sug')) $('#f-sug').classList.add('hidden'); });
f.cond.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#f-sug').classList.add('hidden'); });
